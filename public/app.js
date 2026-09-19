const searchInput = document.getElementById("searchInput");
const checkBtn = document.getElementById("checkBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

const profileName = document.getElementById("profileName");
const profileId = document.getElementById("profileId");
const instagram = document.getElementById("instagram");
const avatar = document.getElementById("avatar");


function showStatus(message) {
  statusBox.style.display = "block";
  statusBox.textContent = message;
}


function resetResult() {
  resultBox.style.display = "none";

  profileName.textContent = "Unknown Profile";
  profileId.textContent = "—";
  instagram.textContent = "—";
  avatar.src = "";
}


function displayLinkedAccounts(accounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) {
    instagram.textContent = "None detected";
    return;
  }

  instagram.textContent = accounts
    .map(account => {
      if (typeof account === "string") {
        return account;
      }

      return (
        account.username ||
        account.name ||
        account.platform ||
        "Linked account"
      );
    })
    .join(", ");
}


checkBtn.addEventListener("click", async () => {

  const input = searchInput.value.trim();

  resetResult();

  if (!input) {
    showStatus("Please enter an email or phone number.");
    return;
  }

  checkBtn.disabled = true;
  checkBtn.textContent = "CHECKING...";

  showStatus("Connecting to verification service...");

  try {

    const response = await fetch("/api/check-facebook", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        input: input
      })
    });


    const data = await response.json();


    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to verify this input."
      );
    }


    const profile = data.profile || {};


    profileName.textContent =
      profile.name || "Unknown Profile";

    profileId.textContent =
      profile.id || "—";


    displayLinkedAccounts(profile.linkedAccounts);


    if (profile.avatar) {
      avatar.src = profile.avatar;
    }


    resultBox.style.display = "block";


    if (profile.live === true) {
      showStatus("Account information found.");
    } else if (profile.live === false) {
      showStatus("Account could not be verified.");
    } else {
      showStatus("Verification result received.");
    }


  } catch (error) {

    console.error(error);

    showStatus(
      error.message || "Something went wrong."
    );

  } finally {

    checkBtn.disabled = false;
    checkBtn.textContent = "CHECK";

  }

});
