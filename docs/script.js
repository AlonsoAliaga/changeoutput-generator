let activeLanguage;
let defaultLanguageData;
let defaultLanguageKeys;
const logger = false;
const logMode = false;
const loggerPrefix = logger ? `[LANGUAGE]` : ""
const loggerHtmlPrefix = logger ? `[HTML]` : ""
const loggerMissingPrefix = logger ? `[MISSING]` : ""
let currentLanguageIsRule = [];
let currentViewers = 0;
let onlineViewersMessages = [
  "🟢 {VIEWERS} online perfecting placeholder output quietly!"
]
let baseLangFlagUrl = "https://raw.githubusercontent.com/AlonsoAliaga/changeoutput-generator/main/assets/flags/{LANG}.png";
//let baseLangFlagUrl = "../assets/flags/{LANG}.png";
let baseLangFileUrl = "https://raw.githubusercontent.com/AlonsoAliaga/changeoutput-generator/main/docs/lang/{LANG}.json";
//let baseLangFileUrl = "./lang/{LANG}.json";
let availableLanguages = ["en","es","fr","it"]
let defaultLanguage = availableLanguages[0]
const langsData = new Map();

let alertTimout;
function alertLanguageNotAvailable(userLang){
  if(alertTimout) {
    clearTimeout(alertTimout);
    var sb = document.getElementById("csnackbar");
    sb.className = sb.className.replace("show", "");
  }
  var sb = document.getElementById("csnackbar");

  //this is where the class name will be added & removed to activate the css
  sb.className = "show";
  sb.innerHTML = `❌ Couldn't find a translation for '${userLang}' language 😔<br>Be the one who give the <a href="https://alonsoaliaga.com/discord" rel="noopener" target="_blank">translation here</a>!`

  alertTimout = setTimeout(()=>{ sb.className = sb.className.replace("show", ""); }, 3000);
}
loadLanguages();
async function loadLanguages() {
  let userLang = resolveLanguage();
  if(!availableLanguages.includes(userLang)) {
    alertLanguageNotAvailable(userLang);
    userLang = defaultLanguage;
  }
  for(let lang of availableLanguages) {
    let data = await onlyLoadAndReturnLanguage(lang);
    if(data) {
      if(lang == "en") {
        defaultLanguageData = data;
        defaultLanguageKeys = Object.keys(data);
      }
      langsData.set(lang,data);
    }
  }
  let flagsDiv = document.getElementById("flags-section");
  for(let [key,data] of langsData) {
    let img = document.createElement("img");
    img.src = baseLangFlagUrl.replace("{LANG}",key);
    img.classList.add("flag");
    img.onclick = function() {
      applyTranslations(data);
      return false;
    }
    flagsDiv.appendChild(img)
  }
  applyTranslations(langsData.get(userLang))
}
//loadDefaultLanguage();
function resolveLanguage() {
    //return "ens"
    // Try getting the user's preferred language from the most reliable source
    if (navigator.languages && Array.isArray(navigator.languages) && navigator.languages.length > 0) {
        return navigator.languages[0].split('-')[0].toLowerCase(); // e.g., "es-ES" -> "es"
    }
    // Fallback to other known navigator properties (cross-browser)
    if (typeof navigator.language === 'string') {
        return navigator.language.split('-')[0].toLowerCase();
    }
    if (typeof navigator.userLanguage === 'string') {
        return navigator.userLanguage.split('-')[0].toLowerCase();
    }
    if (typeof navigator.browserLanguage === 'string') {
        return navigator.browserLanguage.split('-')[0].toLowerCase();
    }
    if (typeof navigator.systemLanguage === 'string') {
        return navigator.systemLanguage.split('-')[0].toLowerCase();
    }
    // Final fallback
    return defaultLanguage.toLowerCase();
}
function toggleDarkmode() {
    if (document.getElementById('darkmode').checked == true) {
      document.body.classList.add('dark');
      //document.getElementById('result').classList.add("darktextboxes");
      for(let d of [...document.querySelectorAll(".lightbuttonboxes")]) {
        //let d = document.getElementById(n);
        if(d) {
          d.classList.remove("lightbuttonboxes");
          d.classList.add("darkbuttonboxes");
        }
      }
      let success = document.getElementById('success_message');
      if(success) {
        success.classList.remove("successlight");
        success.classList.add("successdark");
      }
    } else {
      document.body.classList.remove('dark');
      //document.getElementById('result').classList.remove("darktextboxes");
      //Buttons
      for(let d of [...document.querySelectorAll(".darkbuttonboxes")]) {
        //let d = document.getElementById(n);
        if(d) {
          d.classList.remove("darkbuttonboxes");
          d.classList.add("lightbuttonboxes");
        }
      }
      let success = document.getElementById('success_message');
      if(success) {
        success.classList.remove("successdark");
        success.classList.add("successlight");
      }
    }
    //console.log("Dark mode is now: "+(document.getElementById('darkmode').checked))
}
let options = {
  "equals": "equals",
  "ignorecase": "ignorecase",
  "ignorecolor": "ignorecolor",
  "contains": "contains",
  "greaterorequal": ">=",
  "greater": ">",
  "lowerorequal": "<=",
  "lower": "<",
}
let optionSelect = document.getElementById("generator-rule");
for(let key of Object.keys(options)) {
  let text = options[key];
  let option = document.createElement("option");
  option.value = key
  option.textContent = text;
  option.dataset["i18n"] = `option-${key}`
  optionSelect.appendChild(option)
}
let times = 0;
function loadCounter() {
 let href = window.location.href;
 if(!href.includes(atob("YWxvbnNvYWxpYWdhLmdpdGh1Yi5pbw=="))) return;
 let link = atob("aHR0cHM6Ly9hbG9uc29hcGkuZGlzY2xvdWQuYXBwL2NvdW50ZXI/c2l0ZT08c2l0ZT4ma2V5PTxrZXk+")
  .replace(/<site>/g,"changeoutput-generator").replace(/<key>/g,"KEY-A");
 let counter = document.getElementById("visitor-counter");
 //console.log(link)
 if(counter) {
   $.ajax({
     url: link,
     type: "GET", /* or type:"GET" or type:"PUT" */
     dataType: "json",
     data: {
     },
     success: function (result) {
       if(isNaN(result))
         document.getElementById("counter-amount").innerHTML = "Click to return!";
       else document.getElementById("counter-amount").innerHTML = `Visits: ${result}`;
     },
     error: function (e) {
       times++;
       document.getElementById("counter-amount").innerHTML = "Click to return!";
       if(times <= 1) {
        setTimeout(()=>{
          loadCounter();
        },1000*10);
       }
     }
   });
 }
}
function getRandomViewersMessage() {
  return onlineViewersMessages[Math.floor(Math.random() * onlineViewersMessages.length)]
}
function updateOnlineMessage() {
  if(currentViewers != -1) {
    let newMessage = getRandomViewersMessage();
    let counter = document.getElementById("online-counter");
    counter.textContent = newMessage.replace(/{VIEWERS}/g,currentViewers)
  }
}
let presets = {
  "luckpermsrankorpurchase": {
    name: "[HTML]Shows Luckperms rank prefix or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>Purchase a rank!</span>\"",
    data:{
      "generator-input": "{luckperms_prefix}",
      "generator-rule": "equals",
      "generator-matcher": "",
      "generator-return-match": "&cPurchase a rank!",
      "generator-return-fail": "{luckperms_prefix}",
    }
  },
  "vaultrankorpurchase": {
    name: "[HTML]Shows vault rank prefix or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>Purchase a rank!</span>\"",
    data:{
      "generator-input": "{vault_prefix}",
      "generator-rule": "equals",
      "generator-matcher": "",
      "generator-return-match": "&cPurchase a rank!",
      "generator-return-fail": "{vault_prefix}",
    }
  },
  "betterteamsname": {
    name: "[HTML]Show BetterTeams team name or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>No Team!</span>\"",
    data: {
      "generator-input": "{betterTeams_name}",
      "generator-rule": "equals",
      "generator-matcher": "",
      "generator-return-match": "&cNo team!",
      "generator-return-fail": "{betterTeams_name}"
    }
  },
  "hasenoughmoney": {
    name: "[HTML]If player has enough money, \"<span style='color:rgb(84, 216, 58);font-family: MinecraftBold'>Can be purchased!</span>\" or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>Not enough money!</span>\"",
    data:{
      "generator-input": "{vault_eco_balance}",
      "generator-rule": "greaterorequal",
      "generator-matcher": "1000",
      "generator-return-match": "&aCan be purchased!",
      "generator-return-fail": "&cNot enough money!",
    }
  },
  "isonline": {
    name: "[HTML]If player is online, \"<span style='color:rgb(84, 216, 58);font-family: MinecraftBold'>Online</span>\" or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>Offline</span>\"",
    data: {
      "generator-input": "{player_online}",
      "generator-rule": "equals",
      "generator-matcher": "true",
      "generator-return-match": "&aOnline",
      "generator-return-fail": "&cOffline",
    }
  },
  "hasrankpermission": {
    name: "[HTML]If player has rank permission, \"<span style='color:rgb(84, 216, 58);font-family: MinecraftBold'>Rank Unlocked</span>\" or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>Locked</span>\"",
    data: {
      "generator-input": "{permission_has_permission.for.rank}",
      "generator-rule": "equals",
      "generator-matcher": "true",
      "generator-return-match": "&aRank Unlocked",
      "generator-return-fail": "&cLocked",
    }
  },
  "canfly": {
    name: "[HTML]If player can fly, \"<span style='color:rgb(84, 216, 58);font-family: MinecraftBold'>Flight available!</span>\" or \"<span style='color:rgb(255, 76, 76);font-family: MinecraftBold'>Flight disabled!</span>\"",
    data: {
      "generator-input": "{player_allow_flight}",
      "generator-rule": "equals",
      "generator-matcher": "true",
      "generator-return-match": "&aFlight available!",
      "generator-return-fail": "&cFlight disabled!",
    }
  },
    "sleepingstatus": {
    name: "[HTML]If player is sleeping, \"<span style='color:rgb(65, 62, 211);font-family: MinecraftBold'>Sleeping</span>\" when in bed or Empty",
    data: {
      "generator-input": "{player_is_sleeping}",
      "generator-rule": "equals",
      "generator-matcher": "true",
      "generator-return-match": "&7Sleeping",
      "generator-return-fail": ""
    }
  },
}
function loadPreset(key,data) {
  if(!key || !data) {
    return;
  }
  for(let id of Object.keys(data.data)) {
    let element = document.getElementById(id);
    if(element) {
      element.value = data.data[id];
    }
  }
  updateFixOptionContains();

}
function processAds() {

}
function loadPresets() {
  let optionsPresets = document.getElementById("options-presets");
  for(let key of Object.keys(presets)) {
    let data = presets[key];
    let div = document.createElement("div");
    div.classList.add("darkbuttonboxes")
    div.style.cssText = "width:90%;height:50px;align-content: center;margin: 5px;cursor: pointer";
    div.onclick = function(event) {
      loadPreset(key,data);
      return false;
    }
    let name = data.name;
    if(name.startsWith("[HTML]")) {
      div.innerHTML = name.replace("[HTML]","");
    }else{
      div.textContent = name;
    }
    div.dataset["i18n"] = key;
    optionsPresets.appendChild(div);
  }
  let span = document.createElement("span");
  span.style.cssText = "margin-top: 10px;color:rgb(124, 124, 124)"
  span.innerHTML = "⚠️ If you find an error in the generator, report it in our <a href=\"https://alonsoaliaga.com/donate\" rel=\"noopener\" target=\"_blank\">Discord server</a>!";
  span.dataset["i18n"] = "if-error-report";
  optionsPresets.appendChild(span);
}
for(let id of ["generator-input","generator-matcher","generator-return-match","generator-return-fail"]) {
  let element = document.getElementById(id);
  if(element) {
    element.addEventListener('keyup',()=>{
      generatePlaceholder();
    });
  }
}
function updateFixOptionContains() {
  if(logMode)console.log(`Fixing contains options..`)
  let element = document.getElementById("generator-rule");
  let newValue = element.value;
  //console.log(newValue)
  const elem = document.querySelector(`[data-i18n="generator-is"]`);
  if(newValue == "contains") {
    if(typeof currentLanguageIsRule[1] == "undefined") {
      elem.textContent = currentLanguageIsRule[0]
    }else{
      elem.textContent = currentLanguageIsRule[1]
    }
  }else{
    elem.textContent = currentLanguageIsRule[0]
  }
  generatePlaceholder();
}
for(let id of ["generator-rule"]) {
  let element = document.getElementById(id);
  if(element) {
    element.addEventListener('change',()=>{
      updateFixOptionContains();
    });
  }
}
function generatePlaceholder() {
  let INPUT = document.getElementById("generator-input").value;
  let RULE = options[document.getElementById("generator-rule").value];
  let MATCHER = document.getElementById("generator-matcher").value;
  let RETURN_MATCH = document.getElementById("generator-return-match").value;
  let RETURN_FAIL = document.getElementById("generator-return-fail").value;
  let placeholder = `%changeoutput_${RULE}_input:${INPUT}_matcher:${MATCHER}_ifmatch:${RETURN_MATCH}_else:${RETURN_FAIL}%`
  if(logMode)console.log(`Generated placeholder:`)
  if(logMode)console.log(placeholder);
  document.getElementById("placeholder-output").textContent = placeholder;
}
function loadChecking() {
 let href = window.location.href;
 if(!href.includes(atob("YWxvbnNvYWxpYWdhLmdpdGh1Yi5pbw=="))) return;
 let link = atob("aHR0cHM6Ly9hbG9uc29hcGkuZGlzY2xvdWQuYXBwL2NoZWNraW5nP3NpdGU9PHNpdGU+JmtleT08a2V5Pg==")
  .replace(/<site>/g,"changeoutput-generator").replace(/<key>/g,"KEY-A");
 let counter = document.getElementById("online-counter");
 if(counter) {
   $.ajax({
     url: link,
     type: "GET", /* or type:"GET" or type:"PUT" */
     dataType: "json",
     data: {
     },
     success: function (result) {
        //console.log(`Total fails: ${counter.dataset.failed}`)
        counter.dataset.failed = "0";
        counter.style.display = "flex";
        /*
        if(true){
          currentViewers = -999;
          //counter.textContent = `🟢 ${result} user${result==1?``:`s`} online using our Minecraft Profile Picture Generator!`;
          counter.textContent = getRandomViewersMessage().replace(/{VIEWERS}/g,"999");
          counter.style.backgroundColor = "green";
        }else 
        */
        if(isNaN(result)) {
          counter.textContent = `🟡 You shouldn't be reading this. Report it on https://alonsoaliaga.com/discord`;
          counter.style.backgroundColor = "yellow";
          currentViewers = -1;
        }else{
          currentViewers = +result;
          //counter.textContent = `🟢 ${result} user${result==1?``:`s`} online using our Minecraft Profile Picture Generator!`;
          counter.textContent = getRandomViewersMessage().replace(/{VIEWERS}/g,result);
          counter.style.backgroundColor = "green";
        }
     },
     error: function (e) {
      //console.log(`Total fails: ${counter.dataset.failed}`)
      if(counter.style.display != "none") {
        let currentFails = +counter.dataset.failed;
        if(currentFails >= 1){
          counter.style.display = "none"
        }else{
          counter.textContent = `🔴 Check your internet connection!`;
          counter.style.backgroundColor = "#7c0000";
          counter.dataset.failed = `${currentFails + 1}`
        }
      }
     }
   });
 }
}
window.addEventListener("DOMContentLoaded",()=>{
  loadCounter();
  checkSite(window);
  setTimeout(()=>{
    loadChecking();
    setInterval(()=>{
      loadChecking();
    },10000)
  },2500)
});
function checkSite(window) {
  let search = window.location.search;
  /*
  if(typeof search !== "undefined" && search.length > 0) {
    let parts = atob(search.slice(1)).split("&");
    for(let part of parts) {
      let [k,v] = part.split("=");
      k = btoa(k);
      if(k == "dXNlcm5hbWU=") {
        if(v.match(/[a-z0-9_]/gi)) {
          setTimeout(()=>{
            usernameInput.value = v;
            processUsername();
          },500);
        }
      }
    }
  }
  */
  setTimeout(()=>{
    let href = window.location.href;
    if(!href.includes(atob("YWxvbnNvYWxpYWdhLmdpdGh1Yi5pbw=="))) {
      try{document.title = `Page stolen from https://${atob("YWxvbnNvYWxpYWdhLmdpdGh1Yi5pbw==")}`;}catch(e){}
      window.location = `https://${atob("YWxvbnNvYWxpYWdhLmdpdGh1Yi5pbw==")}/changeoutput-generator/`}
  });
  fetch('https://raw.githubusercontent.com/AlonsoAliaga/AlonsoAliagaAPI/refs/heads/main/api/tools/tools-list.json')
    .then(res => res.json())
    .then(content => {
      let toolsData = content;
      let toolsArray = []
      for(let toolData of toolsData) {
        let clazz = typeof toolData.clazz == "undefined" ? "" : ` class="${toolData.clazz}"`;
        let style = typeof toolData.style == "undefined" ? "" : ` style="${toolData.style}"`;
        toolsArray.push(`<span>💠</span> <span${clazz}${style}><a title="${toolData.description}" id="tool-priority-${toolData.priority}" href="${toolData.link}">${toolData.name}</a></span>`);
      }
      document.getElementById("tools-for-you").innerHTML = toolsArray.join(`<br>`);
    });
}
function copyTextToClipboard(text) {
  let textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.bottom= 0;
  textArea.style.left= 0;

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  document.execCommand('copy');
  alertCopied();
  document.body.removeChild(textArea);
}
let copiedTimeout;
function alertCopied() {
  if(copiedTimeout) {
    clearTimeout(copiedTimeout);
    var sb = document.getElementById("snackbar");
    sb.className = sb.className.replace("show", "");
  }
  var sb = document.getElementById("snackbar");

  //this is where the class name will be added & removed to activate the css
  sb.className = "show";

  copiedTimeout = setTimeout(()=>{ sb.className = sb.className.replace("show", ""); }, 3000);
}
async function onlyLoadAndReturnLanguage(lang) {
    if(logMode)console.log(`Only loading language '${lang}'..`)
    let link = baseLangFileUrl.replace("{LANG}",lang);
    try {
        //const res = await fetch(`./lang/${lang}.json`);
        const res = await fetch(link);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if(logMode)console.log(`Only loaded language '${lang}'!`)
        return data;
    } catch(e) {
        console.log(`Error only loading '${lang}' from '${link}':`);
        console.error(e);
    }
    generatePlaceholder();
}
function applyTranslations(data) {
    if(logMode)console.log(`Applying language '${activeLanguage}'..`)
    for (const expectedKey of defaultLanguageKeys) {
        if(expectedKey == "online-viewers") {
          if(typeof data[expectedKey] == "undefined") {
            onlineViewersMessages = defaultLanguageData[expectedKey];
            updateOnlineMessage();
          }else{
            onlineViewersMessages = data[expectedKey];
            updateOnlineMessage();
          }
          continue;
        }
        const elem = document.querySelector(`[data-i18n="${expectedKey}"]`);
        if(!elem) {
            if(logMode)console.log(`Element with data-i18n='${expectedKey}' is invalid. Skipping..`)
            continue;
        }
        if(typeof data[expectedKey] == "undefined") {
            let value = defaultLanguageData[expectedKey];
            if(expectedKey == "generator-is") {
              currentLanguageIsRule[0] = value.replace("[HTML]","");
            }
            if(expectedKey == "option-contains") {
              if(value.includes("||")) {
                let args = value.split("||",2);
                //console.log(`Args length: ${args.length}`)
                if(args.length >= 2) {
                  value = args[0];
                  currentLanguageIsRule[1] = args[1];
                }else currentLanguageIsRule[1] = undefined;
              }else currentLanguageIsRule[1] = undefined;
            }
            if(logMode)console.log(`Missing translation for data-i18n="${expectedKey}" for '${activeLanguage}'. Using ${defaultLanguage}: ${value}`)
            if(value.startsWith("[HTML]")) {
                elem.innerHTML = `${loggerPrefix}${loggerHtmlPrefix}${loggerMissingPrefix}${value.replace("[HTML]","")}`;
            }else{
                elem.textContent = `${loggerPrefix}${loggerMissingPrefix}${value}`;
            }
        }else{
            let value = data[expectedKey];
            if(expectedKey == "generator-is") {
              currentLanguageIsRule[0] = value.replace("[HTML]","");
            }
            if(expectedKey == "option-contains") {
              if(value.includes("||")) {
                let args = value.split("||",2);
                //console.log(`Args length: ${args.length}`)
                if(args.length >= 2) {
                  value = args[0];
                  currentLanguageIsRule[1] = args[1];
                }else currentLanguageIsRule[1] = undefined;
              }else currentLanguageIsRule[1] = undefined;
            }
            if(logMode)console.log(`Translating data-i18n="${expectedKey}" with element='${elem.id}' to '${activeLanguage}': ${value}`)
            if(value.startsWith("[HTML]")) {
                elem.innerHTML = `${loggerPrefix}${loggerHtmlPrefix}${value.replace("[HTML]","")}`;
            }else{
                elem.textContent = `${loggerPrefix}${value}`;
            }
        }
    }
    updateFixOptionContains();
}
generatePlaceholder();
loadPresets();