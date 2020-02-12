Installation
==================

   To install BooksJS we just need to import PDF.js script and BooksJS script.

   Add this before you Initialize BooksJS:

   .. code-block:: html
    :linenos:

    <script src="https://mozilla.github.io/pdf.js/build/pdf.js"></script>
    <script src="https://booksjs.github.io/books/js/books.min.js"></script>

Intialization
==================

   To Initialize BooksJS we only need to use the booksJsLib function.

   .. code-block:: javascript
    :linenos:

    var init = booksJsLib('pdf_path_or_url');

   pdf_path_or_url is the path pointing to the file.