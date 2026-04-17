#!/bin/bash

# ═══════════════════════════════════════════════════════
#  NOVA BUILDERS — Auto GitHub Push
#  Instrucciones:
#  1. Copia este archivo dentro de la carpeta NovaBuilders
#  2. En Mac: doble clic o ejecuta: bash push_to_github.sh
#  3. Sigue las instrucciones en pantalla
# ═══════════════════════════════════════════════════════

clear
echo "╔══════════════════════════════════════════╗"
echo "║     NOVA BUILDERS — Subir a GitHub       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── 1. Verificar que git está instalado ──────────────
if ! command -v git &> /dev/null; then
  echo "❌  Git no está instalado."
  echo ""
  echo "   Descárgalo gratis en: https://git-scm.com/downloads"
  echo "   Instálalo y vuelve a correr este script."
  echo ""
  read -p "Presiona Enter para cerrar..."
  exit 1
fi
echo "✅  Git detectado: $(git --version)"

# ── 2. Pedir usuario de GitHub ───────────────────────
echo ""
echo "────────────────────────────────────────────"
echo "  ¿Cuál es tu usuario de GitHub?"
echo "  (Si no tienes cuenta, créala gratis en github.com)"
echo "────────────────────────────────────────────"
read -p "  Usuario GitHub: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
  echo "❌  No escribiste ningún usuario. Cierra y vuelve a intentar."
  read -p "Presiona Enter para cerrar..."
  exit 1
fi

# ── 3. Nombre del repositorio ────────────────────────
REPO_NAME="NovaBuilders"
REPO_URL="https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "────────────────────────────────────────────"
echo "  Tu repositorio será:"
echo "  👉  https://github.com/$GITHUB_USER/$REPO_NAME"
echo "────────────────────────────────────────────"
echo ""
echo "  IMPORTANTE: Antes de continuar, crea el repo vacío en GitHub:"
echo ""
echo "  1. Abre este link en tu navegador:"
echo "     https://github.com/new"
echo ""
echo "  2. Repository name: NovaBuilders"
echo "  3. Selecciona: Private"
echo "  4. NO marques ninguna opción extra"
echo "  5. Click en 'Create repository'"
echo ""
read -p "  ¿Ya creaste el repositorio vacío? (escribe 'si' y Enter): " CONFIRM

if [ "$CONFIRM" != "si" ] && [ "$CONFIRM" != "sí" ] && [ "$CONFIRM" != "SI" ]; then
  echo ""
  echo "  Crea el repositorio primero y vuelve a correr el script."
  read -p "  Presiona Enter para cerrar..."
  exit 1
fi

# ── 4. Configurar git user ───────────────────────────
echo ""
echo "────────────────────────────────────────────"
echo "  Configurando tu identidad en Git..."
echo "────────────────────────────────────────────"
git config --global user.name "Isai Tapia"
git config --global user.email "novabuilders@yahoo.com"
echo "  ✅  Identidad configurada"

# ── 5. Inicializar y subir ───────────────────────────
echo ""
echo "────────────────────────────────────────────"
echo "  Preparando el código para subir..."
echo "────────────────────────────────────────────"

# Init solo si no existe .git
if [ ! -d ".git" ]; then
  git init
  echo "  ✅  Repositorio git inicializado"
fi

# Eliminar remote anterior si existe
git remote remove origin 2>/dev/null

# Agregar nuevo remote
git remote add origin "$REPO_URL"
echo "  ✅  Repositorio remoto configurado"

# Stage todos los archivos
git add .
echo "  ✅  Archivos preparados"

# Commit
git commit -m "feat: Nova Builders Estimator Pro v1.0" 2>/dev/null || \
git commit --allow-empty -m "feat: Nova Builders Estimator Pro v1.0"
echo "  ✅  Commit creado"

# Branch main
git branch -M main

# ── 6. Explicar el token ─────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║         NECESITAS UN TOKEN               ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  GitHub ya no acepta contraseña normal."
echo "  Necesitas un Token Personal. Pasos:"
echo ""
echo "  1. Abre este link:"
echo "     https://github.com/settings/tokens/new"
echo ""
echo "  2. En 'Note' escribe:  Nova Builders"
echo "  3. En 'Expiration' elige:  No expiration"
echo "  4. Marca el checkbox:  ✅ repo"
echo "  5. Scroll al fondo → 'Generate token'"
echo "  6. COPIA el token (empieza con ghp_...)"
echo ""
echo "  Cuando git te pida contraseña, pega el token."
echo "  (Al pegarlo NO verás nada en pantalla — es normal)"
echo ""
read -p "  ¿Listo con el token? Presiona Enter para continuar..."

# ── 7. Push ──────────────────────────────────────────
echo ""
echo "────────────────────────────────────────────"
echo "  Subiendo código a GitHub..."
echo "  (cuando pida usuario y contraseña:"
echo "   usuario = $GITHUB_USER"
echo "   contraseña = pega tu token ghp_...)"
echo "────────────────────────────────────────────"
echo ""

git push -u origin main

# ── 8. Resultado ─────────────────────────────────────
if [ $? -eq 0 ]; then
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║   ✅  CÓDIGO SUBIDO EXITOSAMENTE         ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo "  Ve a ver tu código en:"
  echo "  👉  https://github.com/$GITHUB_USER/$REPO_NAME"
  echo ""
  echo "  Para subir cambios futuros, corre:"
  echo "  git add . && git commit -m 'update' && git push"
  echo ""
else
  echo ""
  echo "╔══════════════════════════════════════════╗"
  echo "║   ❌  ALGO SALIÓ MAL                     ║"
  echo "╚══════════════════════════════════════════╝"
  echo ""
  echo "  Problemas más comunes:"
  echo ""
  echo "  1. Token incorrecto → vuelve a crear uno en:"
  echo "     https://github.com/settings/tokens/new"
  echo ""
  echo "  2. Repositorio no creado → ve a github.com/new"
  echo "     y crea 'NovaBuilders' como Private y vacío"
  echo ""
  echo "  3. El repositorio ya existe con código →"
  echo "     bórralo en GitHub Settings y créalo de nuevo vacío"
  echo ""
fi

read -p "  Presiona Enter para cerrar..."
