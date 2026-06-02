<template>
  <div class="gate-wrap">
    <div class="gate-card">
      <img src="@/assets/logo-crm-sales.svg" alt="Dogfy CRM Sales" class="gate-logo" />
      <p class="gate-subtitle">Acceso restringido</p>

      <form class="gate-form" @submit.prevent="submit">
        <div class="gate-field" :class="{ 'gate-field--error': error }">
          <input
            v-model="password"
            :type="show ? 'text' : 'password'"
            placeholder="Contraseña"
            class="gate-input"
            autofocus
          />
          <button type="button" class="gate-eye" @click="show = !show" tabindex="-1">
            <i :class="show ? 'pi pi-eye-slash' : 'pi pi-eye'" />
          </button>
        </div>
        <p v-if="error" class="gate-error">Contraseña incorrecta</p>
        <button type="submit" class="gate-btn">Entrar</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const PASS = 'CRM1234'
const LS_KEY = 'dogfy_crm_auth'

const emit = defineEmits<{ (e: 'unlocked'): void }>()

const password = ref('')
const error    = ref(false)
const show     = ref(false)

function submit() {
  if (password.value === PASS) {
    localStorage.setItem(LS_KEY, '1')
    emit('unlocked')
  } else {
    error.value = true
    password.value = ''
    setTimeout(() => { error.value = false }, 1800)
  }
}
</script>

<style scoped>
.gate-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-50);
}

.gate-card {
  width: 100%;
  max-width: 360px;
  background: var(--n-0);
  border: var(--card-border);
  border-radius: var(--card-radius);
  box-shadow: var(--card-shadow);
  padding: 40px 32px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.gate-logo {
  width: 72px;
  margin-bottom: 8px;
}

.gate-subtitle {
  font-size: 13px;
  color: var(--n-400);
  margin-bottom: 20px;
}

.gate-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gate-field {
  display: flex;
  align-items: center;
  border: 1px solid var(--n-200);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.15s;
  background: var(--n-0);
}
.gate-field:focus-within { border-color: var(--brand); }
.gate-field--error        { border-color: var(--error) !important; }

.gate-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 12px;
  font-size: 14px;
  font-family: inherit;
  color: var(--n-800);
  background: transparent;
}

.gate-eye {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 12px;
  color: var(--n-400);
  font-size: 15px;
  display: flex;
  align-items: center;
}
.gate-eye:hover { color: var(--n-600); }

.gate-error {
  font-size: 12px;
  color: var(--error);
  text-align: center;
  margin-top: -4px;
}

.gate-btn {
  width: 100%;
  padding: 11px;
  border: none;
  border-radius: 8px;
  background: var(--brand);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.gate-btn:hover { background: var(--brand-dark); }
</style>
