const url = './assets/pdf.pdf'
let z_index = 1,
  page,
  container,
  bookContainer,
  frontPage,
  frontPageContainer,
  backPage,
  backPageContainer,
  pageContainer,
  classAttribute,
  styleAttribute,
  dataAttribute
  pdfDoc = null,
  pageNum = 1,
  numPages = null,
  ctx=null;
  pageIsRendering = false,
  pageNumIsPending = [],
  pageCanvasIsPending = []
  tempNum=null,
  tempCanvas=null;

// Render the page
const renderPage = (pdfDoc, num, canvas) => {

  // Get page
  pdfDoc.getPage(num).then(page_ => {
    // Set scale
    const viewport = page_.getViewport({ scale: canvas.parentElement.clientWidth / page_.getViewport({scale:1.0}).width});
    canvas.height = canvas.parentElement.clientHeight;
    canvas.width = canvas.parentElement.clientWidth;
    ctx = canvas.getContext('2d');

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    
    if(!pageIsRendering){
      pageIsRendering = true;
      page_.render(renderCtx).promise.then(() => {
        pageIsRendering = false;
  
        if (pageNumIsPending.length !== 0) {
          tempNum = pageNumIsPending.shift();
          tempCanvas = pageCanvasIsPending.shift();
          renderPage(pdfDoc, tempNum, tempCanvas);
        }
        else{
          if(num === numPages) bindClickEvent();
        }
      });
    }
    else{
      pageNumIsPending.push(num);
      pageCanvasIsPending.push(canvas);
    }
  });
};

// Get Document
const loadDocument = async _ => {
  // Get Document
  pdfDoc = await pdfjsLib.getDocument(url).promise;
  numPages = pdfDoc.numPages;
  container = document.getElementsByClassName('booksjs-preview')[0];
  
  for(let i=1; i<=numPages; i++){
    z_index=numPages-i+1;
    pageContainer = document.createElement("div");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "booksjs-page-container";
    styleAttribute = document.createAttribute("style");
    styleAttribute.value = "z-index: "+ z_index +";";
    dataAttribute = document.createAttribute("data-zindex");
    dataAttribute.value = z_index;
    pageContainer.setAttributeNode(classAttribute);
    pageContainer.setAttributeNode(styleAttribute);
    pageContainer.setAttributeNode(dataAttribute);
    
    page = document.createElement("div");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "booksjs-page";
    page.setAttributeNode(classAttribute);
    
    frontPageContainer = document.createElement("div");
    frontPage = document.createElement("canvas");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "booksjs-page-front";
    dataAttribute = document.createAttribute("data-page");
    dataAttribute.value = i;
    frontPageContainer.setAttributeNode(classAttribute);
    frontPageContainer.setAttributeNode(dataAttribute);

    // Get Document
    renderPage(pdfDoc, i, frontPage);

    i++;
    backPageContainer = document.createElement("div");
    backPage = document.createElement("canvas");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "booksjs-page-back";
    dataAttribute = document.createAttribute("data-page");
    dataAttribute.value = i;
    backPageContainer.setAttributeNode(classAttribute);
    backPageContainer.setAttributeNode(dataAttribute);
    if(i <= numPages){
      // Get Document
      renderPage(pdfDoc, i, backPage);
    }

    backPageContainer.appendChild(backPage);
    frontPageContainer.appendChild(frontPage);
    page.appendChild(backPageContainer);
    page.appendChild(frontPageContainer);
    pageContainer.appendChild(page);
    if(container.hasChildNodes()) container.insertBefore(pageContainer, container.childNodes[0]);
    else container.appendChild(pageContainer);
  }
}

loadDocument();

var count = 1;
function moveBack(element){
    element.style.zIndex=element.dataset.zindex;
    setTimeout(function(){
        element.getElementsByClassName("booksjs-page-front")[0].removeAttribute('style');
        element.getElementsByClassName("booksjs-page-back")[0].removeAttribute('style');
    }, 150);
    setTimeout(function(){
        bindClickEvent()
    }, 800);
}
function hasClass(element, selector) {
  var className = " " + selector + " ";
  if ((" " + element.className + " ").replace(/[\n\t\r]/g, " ").indexOf(className) > -1) {
      return true;
  }
  return false;
}

function turnPage(){
  let x = document.getElementsByClassName("booksjs-page-container");
  if(hasClass(this, 'booksjs-page-turn')){
      let highestIndex = 0;
      let currElement;
      
      for(let i=0; i<x.length; i++){
          if(hasClass(x[i], 'booksjs-page-turn')){
              var currentIndex = parseInt(x[i].style.zIndex);
              if(currentIndex > highestIndex) {
                  highestIndex = currentIndex;
                  currElement = x[i];
              }
          }
      };
      currElement.classList.remove('booksjs-page-turn');
      removeBindClickEvent();
      moveBack(currElement);
      count--;
  }
  else{
      let highestIndex = 0;
      let currElement;
      
      for(let i=0; i<x.length; i++){
        if(!hasClass(x[i], 'booksjs-page-turn')){
            var currentIndex = parseInt(x[i].style.zIndex);
            if(currentIndex > highestIndex) {
                highestIndex = currentIndex;
                currElement = x[i];
            }
        }
      };
      currElement.classList.add('booksjs-page-turn');
      currElement.style.zIndex=count;
      setTimeout(function(){
          backfaceChange(currElement);
      }, 150)
      removeBindClickEvent();
      setTimeout(function(){
          bindClickEvent();
      }, 800);
      count++;
  }
}

function removeBindClickEvent(){
  let temp = document.getElementsByClassName('booksjs-page-container');    
  for(let idx=0; idx<temp.length; idx++){
    temp[idx].removeEventListener('click', turnPage);
  }
}
function bindClickEvent(){
  let temp = document.getElementsByClassName('booksjs-page-container');    
  for(let idx=0; idx<temp.length; idx++){
    temp[idx].addEventListener('click', turnPage);
  }
}
function backfaceChange(element){
  element.getElementsByClassName("booksjs-page-front")[0].style.backfaceVisibility='visible';
  element.getElementsByClassName("booksjs-page-back")[0].style.backfaceVisibility='visible';
  element.getElementsByClassName("booksjs-page-back")[0].style.zIndex=element.dataset.zindex;
}