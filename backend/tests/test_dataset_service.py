import pandas as pd
import pytest

from app.services.dataset_service import DatasetService


class TestDatasetService:
    def test_load_valid_csv(self, tmp_path):
        csv_file = tmp_path / "test.csv"
        csv_file.write_text("a,b,c\n1,2,3\n4,5,6\n")

        service = DatasetService()
        df = service.load_dataset(csv_file)

        assert len(df) == 2
        assert list(df.columns) == ["a", "b", "c"]

    def test_load_nonexistent_file(self):
        service = DatasetService()
        df = service.load_dataset("/nonexistent/path.csv")

        assert isinstance(df, pd.DataFrame)
        assert df.empty

    def test_load_empty_csv(self, tmp_path):
        csv_file = tmp_path / "empty.csv"
        csv_file.write_text("a,b,c\n")

        service = DatasetService()
        df = service.load_dataset(csv_file)

        assert len(df) == 0
        assert list(df.columns) == ["a", "b", "c"]
