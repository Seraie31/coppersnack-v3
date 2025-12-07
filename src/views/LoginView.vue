<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="card max-w-md w-full">
      <h1 class="text-3xl font-bold text-center mb-2 text-primary">
        CopperSnack 3.0
      </h1>
      <p class="text-center text-gray-400 mb-8">
        Connexion au système de gestion CSE
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="input-field"
            placeholder="votre.email@coppernic.fr"
          />
        </div>

        <div>
          <label class="block text-sm font-medium mb-2">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="input-field"
            placeholder="••••••••"
          />
        </div>

        <!-- Lien mot de passe oublié -->
        <div class="flex justify-end mb-2">
          <button
            type="button"
            class="text-xs text-primary hover:underline"
            @click="handleForgotPassword"
          >
            Mot de passe oublié ?
          </button>
        </div>

        <div
          v-if="error"
          class="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full btn-primary disabled:opacity-50"
        >
          {{ loading ? "Connexion..." : "Se connecter" }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          @click="isRegisterMode = !isRegisterMode"
          class="text-primary hover:underline text-sm"
        >
          {{
            isRegisterMode
              ? "Déjà un compte ? Se connecter"
              : "Pas de compte ? S'inscrire"
          }}
        </button>
      </div>

      <!-- Mode Inscription -->
      <div v-if="isRegisterMode" class="mt-4 pt-4 border-t border-gray-700">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Nom complet</label>
          <input
            v-model="displayName"
            type="text"
            class="input-field"
            placeholder="Prénom Nom"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const displayName = ref("");
const isRegisterMode = ref(false);
const loading = ref(false);
const error = ref("");

// Mot de passe oublié
const handleForgotPassword = async () => {
  if (!email.value) {
    error.value =
      "Veuillez saisir votre adresse email pour réinitialiser le mot de passe.";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    await sendPasswordResetEmail(auth, email.value);
    alert(
      `Un email de réinitialisation a été envoyé à ${email.value}.`
    );
  } catch (err) {
    console.error(err);
    if (err.code === "auth/user-not-found") {
      error.value = "Aucun compte n'existe avec cet email.";
    } else if (err.code === "auth/invalid-email") {
      error.value = "Adresse email invalide.";
    } else {
      error.value =
        "Impossible d'envoyer l'email de réinitialisation.";
    }
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    if (isRegisterMode.value) {
      if (!displayName.value) {
        error.value = "Le nom est requis";
        return;
      }
      await authStore.register(
        email.value,
        password.value,
        displayName.value
      );
    } else {
      await authStore.login(email.value, password.value);
    }
    router.push("/");
  } catch (err) {
    console.error(err);
    if (
      err.code === "auth/invalid-credential" ||
      err.code === "auth/wrong-password"
    ) {
      error.value = "Email ou mot de passe incorrect.";
    } else if (err.code === "auth/user-not-found") {
      error.value = "Aucun compte trouvé avec cet email.";
    } else {
      error.value = err.message || "Erreur de connexion.";
    }
  } finally {
    loading.value = false;
  }
};
</script>
