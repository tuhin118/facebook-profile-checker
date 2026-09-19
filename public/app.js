const searchInput = document.getElementById("searchInput");
const checkBtn = document.getElementById("checkBtn");
const statusBox = document.getElementById("status");
const resultBox = document.getElementById("result");

const profileName = document.getElementById("profileName");
const profileId = document.getElementById("profileId");
const instagram = document.getElementById("instagram");
const avatar = document.getElementById("avatar");

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

avatar.src = "";

profileLink.style.display = "none";
profileLink.href = "#";

avatarBadge.textContent = "";
avatarBadge.style.display = "none";

accountStatus.textContent = "UNKNOWN";

customAvatar.src = "";
customAvatar.style.display = "none";

profileNote.textContent = "—";
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

displayLinkedAccounts(
profile.linkedAccounts
);

// Profile avatar
if (profile.avatar) {

avatar.src = profile.avatar;

} else {

avatar.removeAttribute("src");

}

// Facebook profile link
if (profile.profileLink) {

profileLink.href = profile.profileLink;
profileLink.textContent = "Open Facebook Profile";

profileLink.target = "_blank";
profileLink.rel = "noopener noreferrer";

profileLink.style.display = "inline-block";

} else {

profileLink.style.display = "none";

}

// Custom avatar status
if (profile.hasCustomAvatar === true) {

avatarBadge.textContent = "CUSTOM AVATAR";
avatarBadge.style.display = "inline-block";

} else {

avatarBadge.style.display = "none";

}

// Account status
if (profile.live === true) {

accountStatus.textContent = "ACTIVE";

} else if (profile.live === false) {

accountStatus.textContent = "NOT VERIFIED";

} else {

accountStatus.textContent = "UNKNOWN";

}

// Custom avatar is a boolean from the API,
// so don't treat it as an image URL.
customAvatar.style.display = "none";

// Profile note
profileNote.textContent =
profile.profileNote ||
"No additional information.";
}

checkBtn.addEventListener("click", async () => {

const input = searchInput.value.trim();

resetResult();

if (!input) {

showStatus(
  "Please enter an email or phone number."
);

return;

}

checkBtn.disabled = true;
checkBtn.textContent = "CHECKING...";

showStatus(
"Connecting to verification service..."
);

try {

const response = await fetch(
  "/api/check-facebook",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      input: input
    })
  }
);


const data = await response.json();


if (!response.ok || !data.success) {

  throw new Error(
    data.message ||
    "Unable to verify this input."
  );
}


const profile =
  data.profile || {};


displayProfile(profile);


resultBox.style.display = "block";


if (profile.live === true) {

  showStatus(
    "Account information found."
  );

} else if (profile.live === false) {

  showStatus(
    "Account could not be verified."
  );

} else {

  showStatus(
    "Verification result received."
  );
}

} catch (error) {

console.error(
  "Frontend Error:",
  error
);

showStatus(
  error.message ||
  "Something went wrong."
);

} finally {

checkBtn.disabled = false;
checkBtn.textContent = "CHECK";

}

});
