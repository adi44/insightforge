import pandas as pd

class DatasetService:
    @staticmethod
    def load_dataset(file_path: str) -> pd.DataFrame:
        """
        Load a dataset from a CSV file.

        :param file_path: The path to the CSV file.
        :return: A pandas DataFrame containing the dataset.
        """
        try:
            dataset = pd.read_csv(file_path)
            return dataset
        except Exception as e:
            print(f"Error loading dataset: {e}")
            return pd.DataFrame()
        
    