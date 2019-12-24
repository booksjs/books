/*!
 * BooksJS JavaScript Library v0.1
 *
 * Copyright BooksJS and other contributors
 * Released under the MIT license
 *
 * Date: 2019-12-25T04:00Z
 */
function booksjsLib(url){
  // Initiate the self variable to control the library functions
  var self = {};
  self.url = url;
  self.currPageNum = 1;

  // Function to load CSS
  self.loadCSS = function(){
    let headTag = document.getElementsByTagName('head')[0];
    let linkTag;
    let relAttribute;
    let hrefAttribute;

    linkTag = document.createElement("link");
    relAttribute = document.createAttribute("rel");
    relAttribute.value = "stylesheet";
    hrefAttribute = document.createAttribute("href");
    hrefAttribute.value = "../lib/booksjs.css";
    linkTag.setAttributeNode(relAttribute);
    linkTag.setAttributeNode(hrefAttribute);
    headTag.appendChild(linkTag);
  }
  // Load CSS
  self.loadCSS();

  // Function to render page to canvas
  self.renderPage = function(pdfDoc, canvas, num, numPages){
    // Initialize variables needed in this context
    let ctx=null;
    let pageIsRendering = false;
    let pageNumIsPending = [];
    let pageCanvasIsPending = [];
    let tempNum=null;
    let tempCanvas=null;

    // Get page
    pdfDoc.getPage(num).then(page_ => {
      // Set scale
      const viewport = page_.getViewport({ scale: canvas.parentElement.clientWidth / page_.getViewport({scale:1.0}).width});
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.width*1.414;
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
            self.renderPage(pdfDoc, tempCanvas, tempNum, numPages);
          }
          else{
            if(num === numPages) pageManipulation.bindClickEvent();
          }
        });
      }
      else{
        pageNumIsPending.push(num);
        pageCanvasIsPending.push(canvas);
      }
    });
  };

  // Function to load document complete with interactive functions
  self.loadDocument = async function(){
    let bodyTag;
    let page;
    let bookContainer;
    let frontPage;
    let frontPageContainer;
    let backPage;
    let backPageContainer;
    let pageContainer;
    let classAttribute;
    let styleAttribute;
    let dataAttribute;
    let z_index = 1;
    let pdfDoc;
    let numPages;

    pdfDoc = await pdfjsLib.getDocument(self.url).promise;
    numPages = pdfDoc.numPages;
    bodyTag = document.getElementsByTagName('body')[0];

    modalContainer = document.createElement("div");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "booksjs-modal";
    modalContainer.setAttributeNode(classAttribute);
    
    bookContainer = document.createElement("div");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "booksjs-preview";
    bookContainer.setAttributeNode(classAttribute);
    
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

      // Render Page
      self.renderPage(pdfDoc, frontPage, i, numPages);

      i++;
      backPageContainer = document.createElement("div");
      backPage = document.createElement("canvas");
      dataAttribute = document.createAttribute("data-page");
      dataAttribute.value = i;
      backPageContainer.setAttributeNode(dataAttribute);
      if(i <= numPages){
        classAttribute = document.createAttribute("class");
        classAttribute.value = "booksjs-page-back";
        backPageContainer.setAttributeNode(classAttribute);
        // Render page
        self.renderPage(pdfDoc, backPage, i, numPages);
      }
      else{
        classAttribute = document.createAttribute("class");
        classAttribute.value = "booksjs-page-back booksjs-page-empty";
        backPageContainer.setAttributeNode(classAttribute);
      }

      backPageContainer.appendChild(backPage);
      frontPageContainer.appendChild(frontPage);
      page.appendChild(backPageContainer);
      page.appendChild(frontPageContainer);
      pageContainer.appendChild(page);
      if(bookContainer.hasChildNodes()) bookContainer.insertBefore(pageContainer, bookContainer.childNodes[0]);
      else bookContainer.appendChild(pageContainer);
    }

    modalContainer.appendChild(bookContainer);
    bodyTag.appendChild(modalContainer);

    pageManipulation.bindClickEvent();
  }

  var pageManipulation = {};

  pageManipulation.moveBack = function moveBack(element){
      element.style.zIndex=element.dataset.zindex;
      setTimeout(function(){
          element.getElementsByClassName("booksjs-page-front")[0].removeAttribute('style');
          element.getElementsByClassName("booksjs-page-back")[0].removeAttribute('style');
      }, 150);
      setTimeout(function(){
        pageManipulation.bindClickEvent()
      }, 800);
  }
  self.checkClass = function checkClass(element, selector) {
    var className = " " + selector + " ";
    if ((" " + element.className + " ").replace(/[\n\t\r]/g, " ").indexOf(className) > -1) {
        return true;
    }
    return false;
  }

  pageManipulation.turnPage = function turnPage(){
    let x = document.getElementsByClassName("booksjs-page-container");
    if(self.checkClass(this, 'booksjs-page-turn')){
        let highestIndex = 0;
        let currElement;
        
        for(let i=0; i<x.length; i++){
            if(self.checkClass(x[i], 'booksjs-page-turn')){
                var currentIndex = parseInt(x[i].style.zIndex);
                if(currentIndex > highestIndex) {
                    highestIndex = currentIndex;
                    currElement = x[i];
                }
            }
        };
        currElement.classList.remove('booksjs-page-turn');
        pageManipulation.removeBindClickEvent();
        pageManipulation.moveBack(currElement);
        self.currPageNum--;
    }
    else{
        let highestIndex = 0;
        let currElement;
        
        for(let i=0; i<x.length; i++){
          if(!self.checkClass(x[i], 'booksjs-page-turn')){
              var currentIndex = parseInt(x[i].style.zIndex);
              if(currentIndex > highestIndex) {
                  highestIndex = currentIndex;
                  currElement = x[i];
              }
          }
        };
        currElement.classList.add('booksjs-page-turn');
        currElement.style.zIndex=self.currPageNum;
        setTimeout(function(){
          pageManipulation.backfaceChange(currElement);
        }, 150)
        pageManipulation.removeBindClickEvent();
        setTimeout(function(){
          pageManipulation.bindClickEvent();
        }, 800);
        self.currPageNum++;
    }
  }

  pageManipulation.removeBindClickEvent = function removeBindClickEvent(){
    let temp = document.getElementsByClassName('booksjs-page-container');    
    for(let idx=0; idx<temp.length; idx++){
      temp[idx].removeEventListener('click', pageManipulation.turnPage);
    }
  }
  pageManipulation.bindClickEvent = function bindClickEvent(){
    let temp = document.getElementsByClassName('booksjs-page-container');    
    for(let idx=0; idx<temp.length; idx++){
      temp[idx].addEventListener('click', pageManipulation.turnPage);
    }
  }
  pageManipulation.backfaceChange = function backfaceChange(element){
    element.getElementsByClassName("booksjs-page-front")[0].style.backfaceVisibility='visible';
    element.getElementsByClassName("booksjs-page-back")[0].style.backfaceVisibility='visible';
    element.getElementsByClassName("booksjs-page-back")[0].style.zIndex=element.dataset.zindex;
  }

  return self;
}