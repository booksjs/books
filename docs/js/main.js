const url = './docs/pdf.pdf'
let z_index = 1,
  page,
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
  
  for(let i=1; i<=numPages; i++){
    z_index=numPages-i+1;
    pageContainer = document.createElement("div");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "lapor-page-container-a4";
    styleAttribute = document.createAttribute("style");
    styleAttribute.value = "z-index: "+ z_index +";";
    dataAttribute = document.createAttribute("data-zindex");
    dataAttribute.value = z_index;
    pageContainer.setAttributeNode(classAttribute);
    pageContainer.setAttributeNode(styleAttribute);
    pageContainer.setAttributeNode(dataAttribute);
    
    page = document.createElement("div");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "lapor-page-a4";
    page.setAttributeNode(classAttribute);
    
    frontPageContainer = document.createElement("div");
    frontPage = document.createElement("canvas");
    classAttribute = document.createAttribute("class");
    classAttribute.value = "lapor-page-a4-front";
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
    classAttribute.value = "lapor-page-a4-back";
    dataAttribute = document.createAttribute("data-page");
    dataAttribute.value = i;
    backPageContainer.setAttributeNode(classAttribute);
    backPageContainer.setAttributeNode(dataAttribute);
    if(i <= numPages){
      // Get Document
      renderPage(pdfDoc, i, backPage);
    }

    backPageContainer.append(backPage);
    frontPageContainer.append(frontPage);
    page.append(backPageContainer);
    page.append(frontPageContainer);
    pageContainer.append(page);
    $('.lapor-book-a4').prepend(pageContainer);
  }
}

loadDocument();


var count = 1;
function moveBack(element){
    $(element).css('z-index', element.dataset.zindex);
    setTimeout(function(){
        $(element).find(".lapor-page-a4-front").removeAttr('style');
        $(element).find(".lapor-page-a4-back").removeAttr('style');
    }, 150);
    setTimeout(function(){
        bindClickEvent()
    }, 800);
}
function bindClickEvent(){
    $('.lapor-page-container-a4').bind('click', function(){
        if($(this).hasClass('lapor-page-a4-turn')){
            let highestIndex = 0;
            let currElement;
            $(".lapor-page-container-a4").each(function() {
                if($(this).hasClass('lapor-page-a4-turn')){
                    var currentIndex = parseInt($(this).css("zIndex"), 10);
                    if(currentIndex > highestIndex) {
                        highestIndex = currentIndex;
                        currElement = this;
                    }
                }
            });
            $(currElement).removeClass('lapor-page-a4-turn');
            $('.lapor-page-container-a4').unbind();
            moveBack(currElement);
            count--;
        }
        else{
            let highestIndex = 0;
            let currElement;
            $(".lapor-page-container-a4").each(function() {
                if(!$(this).hasClass('lapor-page-a4-turn')){
                    var currentIndex = parseInt($(this).css("zIndex"), 10);
                    if(currentIndex > highestIndex) {
                        highestIndex = currentIndex;
                        currElement = this;
                    }
                }
            });
            $(currElement).addClass('lapor-page-a4-turn');
            $(currElement).css('z-index', count);
            setTimeout(function(){
                backfaceChange(currElement)
            }, 150)
            $('.lapor-page-container-a4').unbind();
            setTimeout(function(){
                bindClickEvent()
            }, 800);
            count++;
        }
    });
}
function backfaceChange(element){
    $(element).find(".lapor-page-a4-front").css('backface-visibility', 'visible');
    $(element).find(".lapor-page-a4-back").css('backface-visibility', 'visible');
    $(element).find(".lapor-page-a4-back").css('z-index', element.dataset.zindex);
}