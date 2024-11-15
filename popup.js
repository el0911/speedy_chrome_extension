document.addEventListener("DOMContentLoaded", async () => {
  const dropZone = document.getElementById("drop-zone");
  const statusDiv = document.getElementById("status");
  const loginButton = document.getElementById("login-btn");

  // Check if user is logged in and show/hide login button
  const authToken = await getAuthToken();
  if (!authToken) {
    loginButton.style.display = "block";
    loginButton.addEventListener("click", async () => {
      const token = await getAuthToken(true);
      if (token) {
        loginButton.style.display = "none";
        statusDiv.textContent = "Authenticated successfully!";
      }
    });
  }

  // Drag and drop file upload
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dropZone.addEventListener("drop", async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
  
    if (file) {
      statusDiv.textContent = "Uploading...";
      const fileLink = await uploadToDrive(file);
  
      if (fileLink) {
        const linkContainer = document.createElement("div");
        const linkElement = document.createElement("a");
        linkElement.href = fileLink;
        linkElement.target = "_blank";
        linkElement.textContent = fileLink.length > 50 ? `${fileLink.slice(0, 47)}...` : fileLink;
  
        const copyButton = document.createElement("button");
        copyButton.textContent = "Copy Public Link";
        copyButton.addEventListener("click", () => {
          navigator.clipboard.writeText(fileLink);
          copyButton.textContent = "Copied!";
        });
  
        linkContainer.appendChild(linkElement);
        linkContainer.appendChild(copyButton);
  
        statusDiv.innerHTML = "";
        statusDiv.appendChild(linkContainer);
      } else {
        statusDiv.textContent = "Upload failed.";
      }
    }
  });

  // async function getAuthToken(interactive = false) {
  //   return new Promise((resolve, reject) => {
  //     chrome.identity.getAuthToken({ interactive,clientId:'184858548113-fv2j47nvap1t6h78s4u7kjk19asmrl7u.apps.googleusercontent.com' }, (token) => {
  //       if (chrome.runtime.lastError || !token) {
  //         reject(chrome.runtime.lastError);
  //       } else {
  //         resolve(token);
  //       }
  //     });
  //   });
  // }
  

  async function getAuthToken(interactive = false) {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken(
        { 
          interactive,
          // clientId: '184858548113-fv2j47nvap1t6h78s4u7kjk19asmrl7u.apps.googleusercontent.com'
        },
        (token) => {
          if (chrome.runtime.lastError || !token) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(token);
          }
        }
      );
    });
  }

  async function uploadToDrive(file) {
    try {
      const authToken = await getAuthToken();
      if (!authToken) throw new Error("Not authenticated");

      const metadata = {
        name: file.name,
        mimeType: file.type
      };

      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", file);

      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + authToken }),
        body: form
      });

      const data = await response.json();
      await makeFilePublic(data.id, authToken);
      return `https://drive.google.com/uc?id=${data.id}`;
    } catch (error) {
      console.error("Upload failed", error);
      return null;
    }
  }

  async function makeFilePublic(fileId) {
    const authToken = await getAuthToken(true);
  
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" })
    });
  
    if (!response.ok) {
      throw new Error(`Failed to make file public: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data;
  }
  
});
