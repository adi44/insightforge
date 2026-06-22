from pathlib import Path

import matplotlib.pyplot as plt
from pandas import DataFrame

OUTPUT_DIR = Path(__file__).resolve().parent.parent.parent / "visualizations"


def generate_visualizations(dataframe: DataFrame, output_dir: Path | None = None) -> list[str]:
    dest = output_dir or OUTPUT_DIR
    dest.mkdir(exist_ok=True)

    numeric_columns = dataframe.select_dtypes(include="number").columns.tolist()
    generated = []

    for col in numeric_columns:
        plt.figure(figsize=(10, 6))
        plt.hist(dataframe[col].dropna(), bins=30, alpha=0.7, color="blue")
        plt.title(f"Histogram of {col}")
        plt.xlabel(col)
        plt.ylabel("Frequency")
        plt.grid(axis="y", alpha=0.75)
        path = dest / f"{col}_histogram.png"
        plt.savefig(path)
        plt.close()
        generated.append(str(path))

    return generated
