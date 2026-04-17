import React, {useState, useRef, useCallback} from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';
import uuid from 'react-native-uuid';

import {COLORS, RADIUS} from '../utils/theme';
import {useBids} from '../context/BidsContext';
import {useSettings} from '../context/SettingsContext';
import {
  calcTotals, generateBidNumber, formatCurrency,
} from '../utils/calculations';
import {
  Division, DEFAULT_DIVISIONS, PROJECT_TYPES,
} from '../utils/types';
import {analyzePlans, estimateFromSF} from '../services/claudeService';
import {saveBidHTML} from '../services/pdfService';
import SendBidModal from '../components/SendBidModal';

const STEP_TITLES = [
  'Client info',
  'Upload plans',
  'Scope of work',
  'Review estimate',
  'Send bid',
];

export default function NewBidScreen() {
  const insets = useSafeAreaInsets();
  const {addBid} = useBids();
  const {settings} = useSettings();

  const [step, setStep] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [showSend, setShowSend] = useState(false);
  const [savedBidId, setSavedBidId] = useState<string | null>(null);

  // Form state
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [projectAddress, setProjectAddress] = useState('');
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [squareFeet, setSquareFeet] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{name: string; uri: string}[]>([]);
  const [divisions, setDivisions] = useState<Division[]>(
    DEFAULT_DIVISIONS.map(d => ({...d, directCost: 0})),
  );
  const [overheadPct, setOverheadPct] = useState(settings.defaultOverheadPct.toString());
  const [profitPct, setProfitPct] = useState(settings.defaultProfitPct.toString());
  const [aiNotes, setAiNotes] = useState('');

  const progress = useRef(new Animated.Value(0)).current;

  const totals = calcTotals(
    divisions,
    parseFloat(overheadPct) || 12,
    parseFloat(profitPct) || 15,
  );

  async function pickPlans() {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
        allowMultiSelection: true,
      });
      setUploadedFiles(prev => {
        const existing = new Set(prev.map(f => f.name));
        const newFiles = results
          .filter(r => !existing.has(r.name ?? ''))
          .map(r => ({name: r.name ?? 'plan', uri: r.uri}));
        return [...prev, ...newFiles];
      });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        Toast.show({type: 'error', text1: 'Upload failed', text2: String(e)});
      }
    }
  }

  async function runAIAnalysis() {
    setAnalyzing(true);
    Animated.timing(progress, {
      toValue: 1, duration: 3500, useNativeDriver: false,
    }).start();

    try {
      let result;
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const base64 = await RNFS.readFile(file.uri, 'base64');
        const mediaType = file.name.endsWith('.pdf')
          ? 'application/pdf'
          : 'image/jpeg';
        result = await analyzePlans(
          base64,
          mediaType as any,
          `${projectType} at ${projectAddress}`,
        );
        setAiNotes(result.notes);
        if (result.squareFeet > 0) setSquareFeet(result.squareFeet.toString());
        setDivisions(result.divisions);
      } else {
        // Fallback: estimate from SF
        const sf = parseFloat(squareFeet) || 500;
        const fallbackDivisions = estimateFromSF(sf, projectType);
        setDivisions(fallbackDivisions);
        setAiNotes(
          `Estimated from ${sf} SF. Upload plans for more accurate pricing.`,
        );
      }
      setStep(2);
    } catch (err) {
      // Fallback on error
      const sf = parseFloat(squareFeet) || 500;
      setDivisions(estimateFromSF(sf, projectType));
      setAiNotes('AI analysis unavailable — using SF-based estimate.');
      setStep(2);
    } finally {
      setAnalyzing(false);
      progress.setValue(0);
    }
  }

  function toggleDivision(id: string) {
    setDivisions(prev =>
      prev.map(d => (d.id === id ? {...d, included: !d.included} : d)),
    );
  }

  function updateDivisionCost(id: string, value: string) {
    setDivisions(prev =>
      prev.map(d =>
        d.id === id ? {...d, directCost: parseFloat(value) || 0} : d,
      ),
    );
  }

  async function saveDraft() {
    const bid = buildBid('draft');
    await addBid(bid);
    setSavedBidId(bid.id);
    Toast.show({type: 'success', text1: 'Draft saved!'});
    return bid;
  }

  async function proceedToSend() {
    if (!clientName.trim()) {
      Alert.alert('Missing info', 'Please enter the client name.');
      setStep(0);
      return;
    }
    const bid = buildBid('draft');
    await addBid(bid);
    setSavedBidId(bid.id);
    await saveBidHTML(bid);
    setShowSend(true);
  }

  function buildBid(status: 'draft' | 'sent') {
    const oh = parseFloat(overheadPct) || 12;
    const pf = parseFloat(profitPct) || 15;
    const {directTotal, overheadAmount, profitAmount, grandTotal} = calcTotals(divisions, oh, pf);
    return {
      id: uuid.v4() as string,
      bidNumber: generateBidNumber(),
      clientName: clientName.trim() || 'Unknown Client',
      clientEmail: clientEmail.trim(),
      projectAddress: projectAddress.trim(),
      projectType,
      squareFeet: parseFloat(squareFeet) || 0,
      divisions,
      overheadPct: oh,
      profitPct: pf,
      directTotal,
      overheadAmount,
      profitAmount,
      grandTotal,
      status,
      createdAt: new Date().toISOString(),
      notes: notes || aiNotes,
      planFiles: uploadedFiles.map(f => f.name),
    };
  }

  function reset() {
    setStep(0);
    setClientName('');
    setClientEmail('');
    setProjectAddress('');
    setSquareFeet('');
    setNotes('');
    setUploadedFiles([]);
    setDivisions(DEFAULT_DIVISIONS.map(d => ({...d, directCost: 0})));
    setAiNotes('');
    setSavedBidId(null);
  }

  function nextStep() {
    if (step === 0) {
      if (!clientName.trim()) {
        Alert.alert('Required', 'Please enter client name.');
        return;
      }
      setStep(1);
    } else if (step === 1) {
      runAIAnalysis();
    } else if (step < 3) {
      setStep(s => s + 1);
    } else {
      proceedToSend();
    }
  }

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Bid</Text>
        <Text style={styles.headerSub}>{STEP_TITLES[step]}</Text>
      </View>

      {/* Step indicator */}
      <View style={styles.stepBar}>
        {STEP_TITLES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.stepDot,
              i < step && styles.stepDone,
              i === step && styles.stepActive,
            ]}
          />
        ))}
      </View>

      {/* AI thinking overlay */}
      {analyzing && (
        <View style={styles.thinkingWrap}>
          <Text style={styles.thinkingIcon}>🤖</Text>
          <Text style={styles.thinkingTitle}>Analyzing your plans...</Text>
          <Text style={styles.thinkingDesc}>
            Reading dimensions, materials, and scope of work
          </Text>
          <ActivityIndicator color={COLORS.gold} size="large" style={{marginTop: 20}} />
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {width: progress.interpolate({inputRange: [0,1], outputRange: ['0%','95%']})},
              ]}
            />
          </View>
        </View>
      )}

      {!analyzing && (
        <>
          <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
            {/* ── STEP 0: Client Info ── */}
            {step === 0 && (
              <View style={styles.stepContent}>
                <Field label="Client name" required>
                  <TextInput style={styles.input} placeholder="e.g. Johnson Family" placeholderTextColor={COLORS.textMuted} value={clientName} onChangeText={setClientName} />
                </Field>
                <Field label="Email address">
                  <TextInput style={styles.input} placeholder="client@email.com" placeholderTextColor={COLORS.textMuted} value={clientEmail} onChangeText={setClientEmail} keyboardType="email-address" autoCapitalize="none" />
                </Field>
                <Field label="Project address">
                  <TextInput style={styles.input} placeholder="123 Main St, Salt Lake City UT" placeholderTextColor={COLORS.textMuted} value={projectAddress} onChangeText={setProjectAddress} />
                </Field>
                <Field label="Project type">
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 14}}>
                    {PROJECT_TYPES.map(pt => (
                      <TouchableOpacity
                        key={pt}
                        style={[styles.typeChip, projectType === pt && styles.typeChipSelected]}
                        onPress={() => setProjectType(pt)}>
                        <Text style={[styles.typeChipText, projectType === pt && styles.typeChipTextSelected]}>{pt}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Field>
                <Field label="Estimated square feet">
                  <TextInput style={styles.input} placeholder="686" placeholderTextColor={COLORS.textMuted} value={squareFeet} onChangeText={setSquareFeet} keyboardType="numeric" />
                </Field>
              </View>
            )}

            {/* ── STEP 1: Upload Plans ── */}
            {step === 1 && (
              <View style={styles.stepContent}>
                <TouchableOpacity style={styles.uploadZone} onPress={pickPlans}>
                  <Text style={styles.uploadIcon}>📐</Text>
                  <Text style={styles.uploadTitle}>Tap to upload plans</Text>
                  <Text style={styles.uploadSub}>PDF, PNG, JPG — up to 50 MB</Text>
                </TouchableOpacity>

                {uploadedFiles.map((f, i) => (
                  <View key={i} style={styles.filePill}>
                    <Text style={{fontSize: 16}}>📄</Text>
                    <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                    <TouchableOpacity onPress={() => setUploadedFiles(prev => prev.filter((_, j) => j !== i))}>
                      <Text style={styles.fileRemove}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.infoBox}>
                  <Text style={styles.infoTitle}>What AI reads from your plans</Text>
                  <Text style={styles.infoText}>Square footage · Materials specified · Windows & doors count · Scope of work · Site conditions · Special details</Text>
                </View>

                <Text style={[styles.infoText, {marginTop: 10, textAlign: 'center'}]}>
                  No plans yet? Skip — we'll estimate from square footage.
                </Text>
              </View>
            )}

            {/* ── STEP 2: Scope ── */}
            {step === 2 && (
              <View style={styles.stepContent}>
                {aiNotes ? (
                  <View style={[styles.infoBox, {marginBottom: 14}]}>
                    <Text style={styles.infoTitle}>AI Analysis Notes</Text>
                    <Text style={styles.infoText}>{aiNotes}</Text>
                  </View>
                ) : null}
                <Text style={styles.stepSub}>Tap to include/exclude divisions</Text>
                {divisions.map(div => (
                  <TouchableOpacity
                    key={div.id}
                    style={[styles.scopeRow, div.included && styles.scopeRowActive]}
                    onPress={() => toggleDivision(div.id)}>
                    <View style={[styles.scopeCheck, div.included && styles.scopeCheckActive]}>
                      {div.included && <Text style={{color: '#fff', fontSize: 10}}>✓</Text>}
                    </View>
                    <Text style={[styles.scopeLabel, div.included && styles.scopeLabelActive]} numberOfLines={1}>{div.label}</Text>
                    {div.included && (
                      <TextInput
                        style={styles.costInput}
                        value={div.directCost > 0 ? div.directCost.toString() : ''}
                        onChangeText={v => updateDivisionCost(div.id, v)}
                        keyboardType="numeric"
                        placeholder="$"
                        placeholderTextColor={COLORS.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                ))}
                <Field label="Notes (optional)" style={{marginTop: 12}}>
                  <TextInput
                    style={[styles.input, {height: 80, textAlignVertical: 'top'}]}
                    multiline
                    placeholder="Special conditions, materials, client requests..."
                    placeholderTextColor={COLORS.textMuted}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </Field>
              </View>
            )}

            {/* ── STEP 3: Estimate ── */}
            {step === 3 && (
              <View style={styles.stepContent}>
                <View style={styles.estimateCard}>
                  <View style={styles.estimateHeader}>
                    <Text style={styles.estimateName}>{clientName}</Text>
                    <View style={styles.aiBadge}><Text style={styles.aiBadgeText}>AI Generated</Text></View>
                  </View>

                  {divisions.filter(d => d.included).map(div => (
                    <View key={div.id} style={styles.divRow}>
                      <Text style={styles.divLabel} numberOfLines={1}>{div.label}</Text>
                      <Text style={styles.divAmount}>{formatCurrency(div.directCost)}</Text>
                    </View>
                  ))}

                  <View style={styles.ohRow}>
                    <View style={[styles.ohBadge, {backgroundColor: 'rgba(251,191,36,0.1)'}]}>
                      <Text style={[styles.ohLabel, {color: '#92650a'}]}>Overhead</Text>
                      <Text style={[styles.ohVal, {color: '#92650a'}]}>{overheadPct}%</Text>
                      <Text style={[styles.ohSub, {color: '#92650a'}]}>{formatCurrency(Math.round(totals.overheadAmount))}</Text>
                    </View>
                    <View style={[styles.ohBadge, {backgroundColor: 'rgba(52,211,153,0.1)'}]}>
                      <Text style={[styles.ohLabel, {color: '#065f46'}]}>Profit</Text>
                      <Text style={[styles.ohVal, {color: '#065f46'}]}>{profitPct}%</Text>
                      <Text style={[styles.ohSub, {color: '#065f46'}]}>{formatCurrency(Math.round(totals.profitAmount))}</Text>
                    </View>
                    <View style={[styles.ohBadge, {backgroundColor: 'rgba(184,134,11,0.1)'}]}>
                      <Text style={[styles.ohLabel, {color: '#92650a'}]}>Total</Text>
                      <Text style={[styles.ohVal, {color: COLORS.gold}]}>{formatCurrency(totals.grandTotal)}</Text>
                      <Text style={[styles.ohSub, {color: '#92650a'}]}>Rounded</Text>
                    </View>
                  </View>

                  <View style={styles.grandRow}>
                    <Text style={styles.grandLabel}>Client price</Text>
                    <Text style={styles.grandAmount}>{formatCurrency(totals.grandTotal)}</Text>
                  </View>
                </View>

                <View style={styles.pctRow}>
                  <View style={{flex: 1}}>
                    <Text style={styles.fieldLabel}>Overhead %</Text>
                    <TextInput style={styles.input} value={overheadPct} onChangeText={setOverheadPct} keyboardType="numeric" />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.fieldLabel}>Profit %</Text>
                    <TextInput style={styles.input} value={profitPct} onChangeText={setProfitPct} keyboardType="numeric" />
                  </View>
                </View>

                <TouchableOpacity style={styles.draftBtn} onPress={saveDraft}>
                  <Text style={styles.draftBtnText}>Save as draft</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{height: 24}} />
          </ScrollView>

          {/* Bottom nav */}
          <View style={[styles.bottomNav, {paddingBottom: insets.bottom || 12}]}>
            {step > 0 && (
              <TouchableOpacity style={styles.btnGhost} onPress={() => setStep(s => s - 1)}>
                <Text style={styles.btnGhostText}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.btnGold} onPress={nextStep}>
              <Text style={styles.btnGoldText}>
                {step === 3 ? 'Send Bid →' : 'Continue →'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {showSend && savedBidId && (
        <SendBidModal
          bidId={savedBidId}
          onClose={() => { setShowSend(false); reset(); }}
        />
      )}
    </View>
  );
}

function Field({
  label, children, required, style,
}: {label: string; children: React.ReactNode; required?: boolean; style?: any}) {
  return (
    <View style={[{marginBottom: 2}, style]}>
      <Text style={styles.fieldLabel}>
        {label}{required ? ' *' : ''}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.dark2},
  header: {
    backgroundColor: COLORS.dark, paddingHorizontal: 20,
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#333',
  },
  headerTitle: {color: '#fff', fontSize: 18, fontWeight: '500'},
  headerSub: {color: '#888', fontSize: 11, marginTop: 2},
  stepBar: {
    flexDirection: 'row', gap: 6, padding: 12, paddingHorizontal: 16,
    backgroundColor: COLORS.dark,
  },
  stepDot: {height: 4, flex: 1, borderRadius: 2, backgroundColor: '#333'},
  stepDone: {backgroundColor: COLORS.gold},
  stepActive: {backgroundColor: COLORS.goldLight, flex: 2},
  scroll: {flex: 1},
  stepContent: {padding: 16},
  stepSub: {fontSize: 13, color: COLORS.textMuted, marginBottom: 12},
  fieldLabel: {fontSize: 12, color: COLORS.textMuted, marginBottom: 6, fontWeight: '500'},
  input: {
    backgroundColor: COLORS.surface, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: RADIUS.md, padding: 11, fontSize: 14, color: COLORS.text,
    marginBottom: 14,
  },
  typeChip: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  typeChipSelected: {borderColor: COLORS.gold, backgroundColor: COLORS.goldDim},
  typeChipText: {fontSize: 13, color: COLORS.textMuted},
  typeChipTextSelected: {color: COLORS.gold},
  uploadZone: {
    borderWidth: 1.5, borderStyle: 'dashed', borderColor: COLORS.border,
    borderRadius: RADIUS.lg, padding: 28, alignItems: 'center', marginBottom: 14,
  },
  uploadIcon: {fontSize: 32, marginBottom: 8},
  uploadTitle: {fontSize: 15, fontWeight: '500', color: COLORS.text},
  uploadSub: {fontSize: 12, color: COLORS.textMuted, marginTop: 4},
  filePill: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.successBg, borderRadius: 10,
    padding: 10, marginBottom: 8,
  },
  fileName: {flex: 1, fontSize: 13, color: COLORS.success, fontWeight: '500'},
  fileRemove: {fontSize: 16, color: COLORS.textMuted},
  infoBox: {
    backgroundColor: COLORS.infoBg, borderRadius: 12, padding: 13,
  },
  infoTitle: {fontSize: 12, color: COLORS.info, fontWeight: '500', marginBottom: 4},
  infoText: {fontSize: 11, color: COLORS.info, lineHeight: 17},
  scopeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: RADIUS.md,
    padding: 12, marginBottom: 7, borderWidth: 0.5, borderColor: COLORS.border,
  },
  scopeRowActive: {borderColor: COLORS.gold, backgroundColor: COLORS.goldDim},
  scopeCheck: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1,
    borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center',
  },
  scopeCheckActive: {backgroundColor: COLORS.gold, borderColor: COLORS.gold},
  scopeLabel: {flex: 1, fontSize: 13, color: COLORS.textMuted},
  scopeLabelActive: {color: COLORS.text, fontWeight: '500'},
  costInput: {
    width: 80, borderWidth: 0.5, borderColor: COLORS.border,
    borderRadius: 8, padding: 6, fontSize: 13, color: COLORS.text,
    textAlign: 'right', backgroundColor: COLORS.surface,
  },
  estimateCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: 16, borderWidth: 0.5, borderColor: COLORS.border, marginBottom: 14,
  },
  estimateHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  estimateName: {fontSize: 15, fontWeight: '500', color: COLORS.text},
  aiBadge: {backgroundColor: COLORS.infoBg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3},
  aiBadgeText: {fontSize: 11, color: COLORS.info},
  divRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 7, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  divLabel: {fontSize: 12, color: COLORS.textMuted, flex: 1, marginRight: 8},
  divAmount: {fontSize: 12, fontWeight: '500', color: COLORS.text},
  ohRow: {flexDirection: 'row', gap: 8, marginVertical: 12},
  ohBadge: {flex: 1, padding: 10, borderRadius: 10, alignItems: 'center'},
  ohLabel: {fontSize: 11, fontWeight: '500'},
  ohVal: {fontSize: 15, fontWeight: '500', marginTop: 3},
  ohSub: {fontSize: 10, marginTop: 2},
  grandRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 12,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
  },
  grandLabel: {fontSize: 15, fontWeight: '500', color: COLORS.text},
  grandAmount: {fontSize: 22, fontWeight: '500', color: COLORS.gold},
  pctRow: {flexDirection: 'row', gap: 12},
  draftBtn: {
    borderWidth: 0.5, borderColor: COLORS.border, borderRadius: RADIUS.md,
    padding: 13, alignItems: 'center', marginTop: 4,
  },
  draftBtnText: {fontSize: 14, color: COLORS.textMuted},
  thinkingWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40,
  },
  thinkingIcon: {fontSize: 48, marginBottom: 16},
  thinkingTitle: {fontSize: 18, fontWeight: '500', color: COLORS.text, textAlign: 'center'},
  thinkingDesc: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 20},
  progressTrack: {
    width: 220, height: 4, backgroundColor: COLORS.border,
    borderRadius: 2, marginTop: 20, overflow: 'hidden',
  },
  progressFill: {height: 4, backgroundColor: COLORS.gold, borderRadius: 2},
  bottomNav: {
    flexDirection: 'row', gap: 10, padding: 12, paddingTop: 10,
    borderTopWidth: 0.5, borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  btnGhost: {
    flex: 1, padding: 13, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border,
    alignItems: 'center', backgroundColor: COLORS.surface2,
  },
  btnGhostText: {fontSize: 14, fontWeight: '500', color: COLORS.text},
  btnGold: {
    flex: 2, padding: 13, borderRadius: RADIUS.md,
    backgroundColor: COLORS.gold, alignItems: 'center',
  },
  btnGoldText: {fontSize: 14, fontWeight: '500', color: '#fff'},
});
