<script lang="ts">
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/authStore";

  let mode = $state<"login" | "register">("login");
  let email = $state("");
  let password = $state("");
  let username = $state("");
  let error = $state("");
  let loading = $state(false);

  async function submit() {
    error = "";
    loading = true;

    const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
    const payload =
      mode === "login"
        ? { email, password }
        : { email, password, username };

    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.detail ?? "Something went wrong.";
        loading = false;
        return;
      }

      authStore.set({ token: data.token, email: data.email });
      goto("/dashboard");
    } catch (err) {
      error = "Could not reach the Archive. Is the backend running?";
      loading = false;
    }
  }

  function toggleMode() {
    mode = mode === "login" ? "register" : "login";
    error = "";
  }
</script>

<div class="login-chamber">
  <div class="rune-ring"></div>

  <div class="login-card">
    <h1 class="title">
      {mode === "login" ? "Enter the Archive" : "Begin Your Fragment"}
    </h1>

    <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
      {#if mode === "register"}
        <label>
          Name
          <input
            type="text"
            value={username}
            oninput={(e) => username = e.target.value}
            placeholder="What shall we call you?"
          />
        </label>
      {/if}

      <label>
        Email
        <input
          type="email"
          required
          value={email}
          oninput={(e) => email = e.target.value}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          required
          value={password}
          oninput={(e) => password = e.target.value}
        />
      </label>

      {#if error}
        <p class="error">{error}</p>
      {/if}

      <button type="submit" class="submit-btn" disabled={loading}>
        {loading ? "…" : (mode === "login" ? "Enter" : "Begin")}
      </button>
    </form>

    <button class="toggle-btn" onclick={toggleMode}>
      {mode === "login" ? "New here? Begin your fragment." : "Already have an account? Enter."}
    </button>
  </div>
</div>

<style>
  .login-chamber {
    position: relative;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a1a24;
    overflow: hidden;
  }

  .rune-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 500px;
    height: 500px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid rgba(255, 140, 66, 0.2);
    box-shadow: 0 0 40px rgba(255, 140, 66, 0.15);
    animation: rotateRing 30s linear infinite;
    pointer-events: none;
  }

  @keyframes rotateRing {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to   { transform: translate(-50%, -50%) rotate(360deg); }
  }

  .login-card {
    position: relative;
    z-index: 1;
    max-width: 360px;
    width: 100%;
    padding: 2.5rem;
    background: rgba(10, 10, 10, 0.6);
    border: 1px solid rgba(255, 140, 66, 0.25);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    box-shadow: 0 0 30px rgba(255, 140, 66, 0.1);
  }

  .title {
    font-family: 'Cinzel', serif;
    text-align: center;
    color: #fbeee2;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    text-shadow: 0 0 10px rgba(255, 140, 66, 0.4);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.9rem;
    color: #fbeee2;
    opacity: 0.85;
  }

  input {
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    background: rgba(255, 140, 66, 0.08);
    border: 1px solid rgba(255, 140, 66, 0.3);
    color: #fbeee2;
    font-size: 1rem;
  }

  .error {
    color: #ff9090;
    font-size: 0.85rem;
    margin: 0;
  }

  .submit-btn {
    margin-top: 0.5rem;
    padding: 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(255, 200, 120, 0.5);
    background: linear-gradient(135deg, rgba(255,140,66,0.2), rgba(255,60,20,0.2));
    color: #fbeee2;
    font-family: 'Cinzel', serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .toggle-btn {
    margin-top: 1.2rem;
    background: none;
    border: none;
    color: rgba(255, 140, 66, 0.7);
    font-size: 0.8rem;
    cursor: pointer;
    text-decoration: underline;
    width: 100%;
    text-align: center;
  }
</style>
