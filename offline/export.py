from PySide6.QtGui import QPixmap, QPainter
from PySide6.QtPrintSupport import QPrinter
from PySide6.QtWidgets import QWidget
from PySide6.QtCore import QRectF

class Exporter:
    @staticmethod
    def to_image(widget: QWidget, path: str, fmt: str='PNG'):
        # Grab a pixmap snapshot of the widget
        pix: QPixmap = widget.grab()
        pix.save(path, fmt.upper())

    @staticmethod
    def to_pdf(widget: QWidget, path: str):
        printer = QPrinter(QPrinter.HighResolution)
        printer.setOutputFormat(QPrinter.PdfFormat)
        printer.setOutputFileName(path)
        painter = QPainter(printer)
        try:
            # Render widget to pixmap first, then scale to fit page while preserving aspect ratio
            pix: QPixmap = widget.grab()
            if pix.isNull():
                return
            page_rect = printer.pageRect()  # QMargins in device units
            target = QRectF(0, 0, page_rect.width(), page_rect.height())
            src = QRectF(0, 0, pix.width(), pix.height())
            painter.drawPixmap(target, pix, src)
        finally:
            painter.end()
