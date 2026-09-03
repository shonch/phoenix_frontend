<script lang="ts">
  import { goto } from "$app/navigation";
  import { PUBLIC_API_URL } from '$env/static/public';

  let email = $state("");
  let recoveryCode = $state("");
  let newPassword = $state("");
  let error = $state("");
  let loading = $state(false);
  let success = $state(false);
  let newRecoveryCode = $state(null);

  async function submit() {
    error = "";
    loading = true;

    try {
      const res = await fetch(`${PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          recovery_code: recoveryCode,
          new_password: newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.detail ?? "Something went wrong.";
        loading = false;
        return;
      }

      success = true;
      newRecoveryCode = data.new_recovery_code;
    } catch (err) {
      error = "Could not reach the Archive. Is the backend running?";
    } finally {
      loading = false;
    }
  }
</script>

<div class="reset-chamber">
  <div class="rune-ring"></div>

  <div class="reset-card">
    {#if success}
      <h1 class="title">Password Reset</h1>
      <p class="success-msg">Your password has been changed.</p>

      <p class="recovery-warning">Your recovery code has been renewed — save this new one:</p>
      <p class="recovery-code">{newRecoveryCode}</p>

      <button class="submit-btn" onclick={() => goto('/login')}>Return to Login</button>
    {:else}
      <h1 class="title">Reset Your Password</h1>

      <form onsubmit={(e) => { e.preventDefault(); submit(); }}>
        <label>
          Email
          <input type="email" required bind:value={email} />
        </label>

        <label>
          Recovery Code
          <input type="text" required bind:value={recoveryCode} placeholder="XXXX-XXXX-XXXX" />
        </label>

        <label>
          New Password
          <input type="password" required bind:value={newPassword} />
        </label>

        {#if error}
          <p class="error">{error}</p>
        {/if}

        <button type="submit" class="submit-btn" disabled={loading}>
          {loading ? "…" : "Reset Password"}
        </button>
      </form>
    {/if}
  </div>
</div>

<style>
  .reset-chamber {
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
    pointer-events: none;
  }

  .reset-card {
    position: relative;
    z-index: 1;
    max-width: 380px;
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
    font-size: 1.4rem;
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

  .success-msg {
    text-align: center;
    color: #9fd6a0;
    margin-bottom: 1.5rem;
  }

  .recovery-warning {
    font-size: 0.85rem;
    color: #f0c090;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .recovery-code {
    font-size: 1.1rem;
    letter-spacing: 0.05em;
    text-align: center;
    padding: 0.6rem;
    background: rgba(255, 140, 66, 0.1);
    border-radius: 6px;
    margin-bottom: 1.5rem;
    word-break: break-all;
  }

  .submit-btn {
    width: 100%;
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
</style>
