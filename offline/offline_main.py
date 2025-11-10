import sys
from PySide6.QtWidgets import QApplication

# Support both "python -m offline.offline_main" (package context)
# and direct script execution "python offline/offline_main.py".
try:
    # Package-relative import when module executed with -m
    from .main_window import MainWindow  # type: ignore
except ImportError:
    # Fallback: absolute package import or local path import when run as a script
    try:
        from offline.main_window import MainWindow  # type: ignore
    except ImportError:
        # Last resort: add script directory to sys.path and import locally
        import os
        sys.path.append(os.path.dirname(__file__))
        from main_window import MainWindow  # type: ignore

def main():
    app = QApplication(sys.argv)
    win = MainWindow()
    win.resize(900, 700)
    win.show()
    sys.exit(app.exec())

if __name__ == '__main__':
    main()
