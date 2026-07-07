function toggleFields(){
  let type = document.getElementById('type').value;
  document.getElementById('familyDiv').classList.add('hide');
  document.getElementById('commDiv').classList.remove('hide');
  
  if(type == 'family'){
    document.getElementById('familyDiv').classList.remove('hide');
    document.getElementById('commDiv').classList.add('hide'); // Family me commutation nahi
  }
  if(type == 'medical'){
    document.getElementById('service').value = 10; // Min 10 years for medical
  }
}

function calculate(){
  let type = document.getElementById('type').value;
  let totalBasic = parseFloat(document.getElementById('totalBasic').value) || 0;
  let service = parseFloat(document.getElementById('service').value) || 0;
  let age = parseInt(document.getElementById('age').value) || 60;
  let leave = Math.min(parseFloat(document.getElementById('leave').value) || 0, 365);
  let commPercent = parseFloat(document.getElementById('commutation').value) || 0;

  let avgBasic = totalBasic / 36;
  let grossPension = (avgBasic * service * 7) / 300;
  if(grossPension > avgBasic) grossPension = avgBasic;
  if(grossPension < 10000) grossPension = 10000;

  let resultHTML = "";
  let netPension = 0, lumpSum = 0;

  // 1. NORMAL RETIREMENT
  if(type == 'normal'){
    let commuted = grossPension * (commPercent/100);
    netPension = grossPension - commuted;
    let ageFactor = age <= 55 ? 9.7 : age <= 60 ? 9.1 : 8.5;
    lumpSum = commuted * 12 * ageFactor;
    
    resultHTML = `
    <p><b>Type:</b> Normal Retirement</p>
    <p><b>Gross Pension:</b> Rs. ${grossPension.toFixed(0)}/Month</p>
    <p><b>Net Pension:</b> Rs. ${netPension.toFixed(0)}/Month</p>
    <p><b>Commutation Lump Sum:</b> Rs. ${lumpSum.toFixed(0)}</p>`;
  }

  // 2. FAMILY PENSION RULE
  if(type == 'family'){
    let familyPer = parseFloat(document.getElementById('familyPercent').value);
    netPension = grossPension * (familyPer/100);
    // Family pension me commutation aur lump sum nahi milta
    resultHTML = `
    <p><b>Type:</b> Family Pension</p>
    <p><b>Original Gross Pension:</b> Rs. ${grossPension.toFixed(0)}/Month</p>
    <p><b>Family Pension ${familyPer}%:</b> Rs. ${netPension.toFixed(0)}/Month</p>
    <p><b>Note:</b> Widow ko 10 saal ya dobara shadi tak. Aulad ko 21 saal tak.</p>`;
  }

  // 3. MEDICAL/INVALID RETIREMENT RULE
  if(type == 'medical'){
    if(service < 10) service = 10; // Min 10 years considered
    grossPension = (avgBasic * service * 7) / 300;
    let commuted = grossPension * (commPercent/100);
    netPension = grossPension - commuted;
    let ageFactor = 9.7; // Medical me max factor
    lumpSum = commuted * 12 * ageFactor;

    resultHTML = `
    <p><b>Type:</b> Medical Retirement</p>
    <p><b>Service Counted:</b> ${service} Years - Min 10 Years</p>
    <p><b>Gross Pension:</b> Rs. ${grossPension.toFixed(0)}/Month</p>
    <p><b>Net Pension:</b> Rs. ${netPension.toFixed(0)}/Month</p>
    <p><b>Commutation Lump Sum:</b> Rs. ${lumpSum.toFixed(0)}</p>
    <p><b>Note:</b> Age limit nahi lagegi, Medical Board certificate zaroori</p>`;
  }

  // Common: Leave Encashment
  let lastBasic = avgBasic;
  let leaveEncash = (lastBasic * leave) / 30;
  resultHTML += `<p><b>Leave Encashment:</b> Rs. ${leaveEncash.toFixed(0)}</p>`;

  document.getElementById('resultBox').innerHTML = resultHTML;
  document.getElementById('result').classList.remove('hide');

  window.resultData = {type, netPension, lumpSum, leaveEncash};
}

function downloadPDF(){
  let d = window.resultData;
  let text = `Punjab Pension Result\nType: ${d.type}\nNet Pension: ${d.netPension.toFixed(0)}\nLumpSum: ${d.lumpSum.toFixed(0)}\nLeave: ${d.leaveEncash.toFixed(0)}`;
  let blob = new Blob([text], {type: 'text/plain'});
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Pension_Result.txt';
  a.click();
}

function shareResult(){
  let d = window.resultData;
  let text = `Punjab Pension: ${d.type} - Net ${d.netPension.toFixed(0)}/Month`;
  if(navigator.share){ navigator.share({title: 'Pension Result', text: text}); }
  else { alert(text); }
}
