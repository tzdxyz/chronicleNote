// FUNTION:
// this scheduler imitate anki's scheduler 
// ... and used for ChronicleNote to change review property
// AUTHOR:
// Tom

// UPDATES:
// 1.01(23042023): parse score into number 
// 1.02(24042023): extend maxInterval to 180 days.


const maxInterval = 180;

// interval days
function I(n, Inm1, EF){
  let i;
  if (n==0 || n==-1){
    i = 0;
  } else
  if (n == 1){
    i = 1;
  } else
  if (n == 2){
    i = 6;
  } else {
    i = Math.round(Inm1*EF);
  }

  // maxium day interval
  if (i>maxInterval) i=maxInterval;
  return i;
}

//Easy_Factor
function changeEF(EF, score){
  switch (score) {
    case 1:
      EF -= 0.2;  break;
    case 2:
      EF -= 0.15; break;
    case 3:
      EF += 0;    break;
    case 4:
      EF += 0.15; break;
  }
  
  // easy factor is bounded in 1.3~3.0
  if (EF<1.3) EF=1.3;
  if (EF>2.5) EF=2.5;

  return EF;
}

// parse n_EF_dateStr_Inm1
function parseReview(cbStr){
  let n, EF, dateStr, Inm1, lastReviewDateStr;
  [n, EF, dateStr, Inm1, lastReviewDateStr] = cbStr.split("_");

  // this date means next review date
  let date = new Date(dateStr.slice(4,8)+"-"+dateStr.slice(2,4)+"-"+dateStr.slice(0,2));
  // this date means last review date
  let lastReviewDate
  if (lastReviewDateStr != undefined)
    lastReviewDate= new Date(lastReviewDateStr.slice(4,8)+"-"+lastReviewDateStr.slice(2,4)+"-"+lastReviewDateStr.slice(0,2));  
  else
    lastReviewDate = "none";
  
  n = Number(n); EF = Number(EF);
  return [n, EF, date, Inm1, lastReviewDate];
}

function changeReview(cbStr, score){
  let n, EF, date, Inm1, lastReviewDate;
  [n, EF, date, Inm1, lastReviewDate] = parseReview(cbStr);
  score = Number(score);
  
  // learning stage 1
  if (n ==-1){
    if (score == 2 || score == 3){
      n = 0;
      date.setDate(date.getDate() + I(n,Inm1, EF));
    } else
    if (score == 4){
      n = 1;
      date.setDate(date.getDate() + I(n,Inm1, EF));
    }
  } else

  // learning stage 2
  if (n == 0){
    if (score == 1){
      n = -1;
    } else
    if (score == 3 || score == 4){
      n = 1
      let In = I(n,Inm1, EF);
      date.setDate(date.getDate() + In);
      Inm1 = In;
    }
  } else 

  // review stage
  if (n > 0){
    EF=changeEF(EF,score);
    if (score == 1){
      n = -1;
      Inm1 = 0;
    } else {
      let In;
      if (score == 2) {In = 1.2*Inm1; if (In>maxInterval) In = 0.5*Inm1} else {In = I(n,Inm1, EF);}
      In = Math.round(In);
      date.setDate(date.getDate() + In);
      Inm1 = In;
      n = n + 1;
    }
  }
  
  let lastReviewDateStr = (new Date()).toLocaleDateString('en-GB').split("/").join("");
  return (n+"_"+EF+"_"+date.toLocaleDateString('en-GB').split("/").join("")+"_"+Inm1+"_"+lastReviewDateStr);
}


module.exports ={
  changeReview
}