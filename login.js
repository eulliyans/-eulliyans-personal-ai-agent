
// EULLIYAN AI — Owner Login & Password Reset
// Version: 1.1.0

const SUPABASE_URL = "https://byajjrvolofvgewpwswk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2FjcIO6DkXPNInB6KUngVg_4_cAx4Z2";

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

const forgotPasswordButton = document.getElementById("forgotPasswordButton");
const resetSection = document.getElementById("resetSection");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const resetPasswordButton = document.getElementById("resetPasswordButton");

// Show messages
function showMessage(message, success = false) {
  loginMessage.style.color = success ? "#6ee7a0" : "#ff7777";
  loginMessage.textContent = message;
}

// Show / Hide Password
togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.textContent = isPassword ? "Hide" : "Show";
});

// Owner Login
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!resetSection.hidden) return;

  loginButton.disabled = true;
  loginButton.textContent = "Signing in...";
  showMessage("");

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: emailInput.value.trim(),
        password: passwordInput.value
      });

    if (error) throw error;

    if (!data.user || data.user.id !== OWNER_ID) {
      await supabaseClient.auth.signOut();
      throw new Error("Access denied. Owner account only.");
    }

    showMessage("Owner verified. Login successful!", true);

  } catch (error) {
    showMessage(error.message);
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = "Sign In";
  }
});

// Forgot Password — Send Recovery Email
forgotPasswordButton.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email) {
    showMessage("Please enter your email address first.");
    emailInput.focus();
    return;
  }

  forgotPasswordButton.disabled = true;
  forgotPasswordButton.textContent = "Sending...";

  try {
    const redirectURL =
      window.location.origin + window.location.pathname;

    const { error } =
      await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: redirectURL
      });

    if (error) throw error;

    showMessage("Password reset email sent. Please check your inbox.", true);

  } catch (error) {
    showMessage(error.message);
  } finally {
    forgotPasswordButton.disabled = false;
    forgotPasswordButton.textContent = "Forgot Password?";
  }
});

// Detect Recovery Link
async function checkRecoveryLink() {
  const params = new URLSearchParams(
    window.location.hash.substring(1)
  );

  if (params.get("type") !== "recovery") return;

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    showMessage("Invalid or expired recovery link.");
    return;
  }

  try {
    const { data, error } = await supabaseClient.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    if (error) throw error;

    if (!data.user || data.user.id !== OWNER_ID) {
      await supabaseClient.auth.signOut();
      throw new Error("Access denied. Owner account only.");
    }

    resetSection.hidden = false;
    forgotPasswordButton.hidden = true;
    loginButton.hidden = true;

    showMessage("Enter your new password.", true);

    // Remove recovery tokens from the visible URL
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.search
    );

  } catch (error) {
    showMessage(error.message);
  }
}

// Update Password
resetPasswordButton.addEventListener("click", async () => {
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (newPassword.length < 8) {
    showMessage("Password must be at least 8 characters.");
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage("Passwords do not match.");
    return;
  }

  resetPasswordButton.disabled = true;
  resetPasswordButton.textContent = "Updating...";

  try {
    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser();

    if (userError) throw userError;

    if (!userData.user || userData.user.id !== OWNER_ID) {
      throw new Error("Owner verification failed.");
    }

    const { error } = await supabaseClient.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;

    await supabaseClient.auth.signOut();

    resetSection.hidden = true;
    forgotPasswordButton.hidden = false;
    loginButton.hidden = false;

    passwordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";

    showMessage("Password updated successfully. Please sign in.", true);

  } catch (error) {
    showMessage(error.message);
  } finally {
    resetPasswordButton.disabled = false;
    resetPasswordButton.textContent = "Update Password";
  }
});

// Start recovery check
checkRecoveryLink();
