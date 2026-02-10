const scriptURL =
  "https://script.google.com/macros/s/AKfycbyWNWRv5wzR9rnL4DuvISw0crIXioO2XmJRHPChOZTSYtZSRVh5u87XOxnIRgM1XPFQ/exec";
const LOCAL_API_PORT = "5000";
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});
const form = document.forms["contactForm"];
form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  // Validate reCAPTCHA
  const recaptchaResponse = grecaptcha.getResponse();
  if (!recaptchaResponse) {
    alert("Please complete the CAPTCHA verification.");
    return;
  }
  
  document.getElementById("form_loader").style.visibility = "visible";
  $("body").addClass("stop-scrolling");
  
  // Add reCAPTCHA response to form data
  const formData = new FormData(form);
  formData.append('g-recaptcha-response', recaptchaResponse);
  
  fetch(scriptURL, { method: "POST", body: formData })
    .then((response) => {
      document.getElementById("contactForm").reset();
      grecaptcha.reset(); // Reset reCAPTCHA after successful submission
      document.getElementById("form_loader").style.visibility = "hidden";
      alert("Thank you for contacting! I will get back to you soon.");
      $("body").removeClass("stop-scrolling");
    })
    .catch((error) => {
      console.error(error.message);
      document.getElementById("contactForm").reset();
      grecaptcha.reset(); // Reset reCAPTCHA on error
      document.getElementById("form_loader").style.visibility = "hidden";
      $("body").removeClass("stop-scrolling");
    });
});

function isMobileDevice() {
  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

if (isMobileDevice()) {
  document.querySelectorAll("#admits img").forEach((image) => {
    image.style.opacity = "1";
  });
}

new Glider(document.querySelector(".glider"), {
  slidesToShow: 1,
  slidesToScroll: 5,
  draggable: true,
  dots: ".dots",
  responsive: [
    {
      breakpoint: 1200,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 1000,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 500,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      },
    },
  ],
});
fetch("https://api.ipify.org?format=json")
  .then((data) => data.json())
  .then((data) => {
    const apiBaseUrl = getVisitorApiBaseUrl();
    const domainParam = getVisitorDomainParam();
    let url =
      `${apiBaseUrl}/counterIncrease/` +
      data.ip + "?domain=" + domainParam + "&source=" + document.referrer;
    fetch(url)
      .then((repo) => repo.json())
      .then((data) => {
        document.getElementById("visit_count").innerHTML = data.count;
        visitId = data.visit_id || null;
        if (visitId && pendingVisitorMeta) {
          sendVisitorMeta(pendingVisitorMeta.name, pendingVisitorMeta.role);
          pendingVisitorMeta = null;
        }
      });
  });

const visitorChatbot = document.getElementById("visitor_chatbot");
const visitorChatbotPanel = document.getElementById("visitor_chatbot_panel");
const visitorChatbotToggle = document.getElementById("visitor_chatbot_toggle");
const visitorChatbotClose = document.getElementById("visitor_chatbot_close");
const visitorChatbotSkip = document.getElementById("visitor_chatbot_skip");
const visitorChatbotForm = document.getElementById("visitor_chatbot_form");
const visitorChatbotThanks = document.getElementById("visitor_chatbot_thanks");
const visitorNameInput = document.getElementById("visitor_name");
const visitorRoleSelect = document.getElementById("visitor_role");
const visitorChatbotSubmit = document.getElementById("visitor_chatbot_submit");
let visitId = null;
let pendingVisitorMeta = null;

const getVisitorApiBaseUrl = () => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  const configuredPort = LOCAL_API_PORT;
  return isLocalhost
    ? `http://127.0.0.1:${configuredPort}`
    : "https://anirudhbelwadiportfolio.pythonanywhere.com";
};

const getVisitorDomainParam = () => {
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
  return window.location.hostname === "anirudhbelwadi.com" || isLocalhost
    ? "true"
    : "false";
};

const sendVisitorMeta = (name, role) => {
  if (!visitId) {
    pendingVisitorMeta = { name, role };
    return;
  }

  const apiBaseUrl = getVisitorApiBaseUrl();

  fetch(`${apiBaseUrl}/visitMeta/${visitId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, role }),
  }).catch((error) => {
    console.error("Error saving visitor meta:", error.message || error);
  });
};

if (
  visitorChatbot &&
  visitorChatbotPanel &&
  visitorChatbotToggle &&
  visitorChatbotForm &&
  visitorNameInput &&
  visitorRoleSelect &&
  visitorChatbotSubmit
) {
  const setChatbotOpen = (isOpen) => {
    visitorChatbotPanel.classList.toggle("open", isOpen);
    visitorChatbotToggle.setAttribute("aria-expanded", String(isOpen));
  };

  setChatbotOpen(true);

  const updateChatbotState = () => {
    const nameReady = visitorNameInput.value.trim().length > 0;
    const roleReady = visitorRoleSelect.value.trim().length > 0;
    visitorChatbotSubmit.disabled = !(nameReady && roleReady);
  };

  visitorNameInput.addEventListener("input", updateChatbotState);
  visitorRoleSelect.addEventListener("change", updateChatbotState);

  visitorChatbotForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const nameValue = visitorNameInput.value.trim();
    const roleValue = visitorRoleSelect.value.trim();

    if (!nameValue || !roleValue) {
      updateChatbotState();
      return;
    }

    if (visitorChatbotThanks) {
      visitorChatbotThanks.textContent = `Thanks, ${nameValue}! Enjoy the portfolio.`;
    }
    sendVisitorMeta(nameValue, roleValue);
    visitorChatbotToggle.style.display = "none";
    visitorChatbotPanel.classList.add("submitted");
    setTimeout(() => {
      setChatbotOpen(false);
    }, 3000);
  });

  visitorChatbotToggle.addEventListener("click", () => {
    setChatbotOpen(!visitorChatbotPanel.classList.contains("open"));
  });

  if (visitorChatbotClose) {
    visitorChatbotClose.addEventListener("click", () => {
      setChatbotOpen(false);
    });
  }

  if (visitorChatbotSkip) {
    visitorChatbotSkip.addEventListener("click", () => {
      setChatbotOpen(false);
    });
  }
}
