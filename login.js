
// EULLIYAN AI — Owner Login
// Version: 1.0.0

const SUPABASE_URL = https://byajjrvolofvgewpwswk.supabase.co
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_PUBLISHABLE_KEY";

const OWNER_ID = "da203003-ec49-4675-8c6a-740f5fd3b6c5";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");

// Show / Hide Password
togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Hide" : "Show";
});

// Owner Login
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "";
  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: emailInput.value.trim(),
      password: passwordInput.value
    });

    if (error) throw error;

    // Verify Owner Identity
    if (!data.user || data.user.id !== OWNER_ID) {
      await supabaseClient.auth.signOut();
      throw new Error("Access denied. Owner account only.");
    }

    loginMessage.style.color = "#6ee7a0";
    loginMessage.textContent = "Owner verified. Login successful!";

    // Dashboard will be connected after its creation.

  } catch (error) {
    loginMessage.style.color = "#ff7777";
    loginMessage.textContent = error.message;
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

