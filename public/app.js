const searchInput = document.getElementById("searchInput");
const checkBtn = document.getElementById("checkBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

const profileName = document.getElementById("profileName");
const profileId = document.getElementById("profileId");
const instagram = document.getElementById("instagram");
const avatar = document.getElementById("avatar");

// New result fields
const profileLink = document.getElementById("profileLink");
const avatarBadge = document.getElementById("avatarBadge");
const accountStatus = document.getElementById("accountStatus");
const customAvatar = document.getElementById("customAvatar");
const profileNote = document.getElementById("profileNote");


function showStatus(message) {
  statusBox.style.display = "block";
  statusBox.textContent = message;
}


function resetResult() {
  resultBox.style.display = "none";

  profileName.textContent = "Unknown Profile";
  profileId.textContent = "—";
  instagram.textContent = "—";

  if (avatar) {
    avatar.src = "";
  }

  if (profileLink) {
    profileLink.textContent = "—";
    profileLink.href = "#";
    profileLink.style.display = "none";
  }

  if (avatarBadge) {
    avatarBadge.textContent = "";
    avatarBadge.style.display = "none";
  }

  if (accountStatus) {
    accountStatus.textContent = "—";
  }

  if (customAvatar) {
    customAvatar.src = "";
    customAvatar.style.display = "none";
  }

  if (profileNote) {
    profileNote.textContent = "—";
  }
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


function displayProfile(profile) {

  profileName.textContent =
    profile.name || "Unknown Profile";

  profileId.textContent =
    profile.id || "—";

  displayLinkedAccounts(profile.linkedAccounts);


  // Main avatar
  if (profile.avatar) {
    avatar.src = profile.avatar;
  }


  // Profile link
  if (profileLink && profile.profileLink) {
    profileLink.textContent = profile.profileLink;
    profileLink.href = profile.profileLink;
    profileLink.target = "_blank";
    profileLink.rel = "noopener noreferrer";
    profileLink.style.display = "inline-block";
  }


  // Avatar badge
  if (avatarBadge && profile.avatarBadge) {
    avatarBadge.textContent = profile.avatarBadge;
    avatarBadge.style.display = "inline-block";
  }


  // Account status
  if (accountStatus) {

    if (profile.accountStatus) {
      accountStatus.textContent = profile.accountStatus;

    } else if (profile.live === true) {
      accountStatus.textContent = "Active";

    } else if (profile.live === false) {
      accountStatus.textContent = "Not verified";

    } else {
      accountStatus.textContent = "Unknown";
    }
  }


  // Custom avatar
  if (customAvatar && profile.customAvatar) {
    customAvatar.src = profile.customAvatar;
    customAvatar.style.display = "block";
  }


  // Profile note
  if (profileNote) {
    profileNote.textContent =
      profile.profileNote || "No additional information.";
  }
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


    displayProfile(profile);


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
