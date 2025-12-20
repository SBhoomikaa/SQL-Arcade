
export type CsvAnalysis = {
  id: string; // Unique ID for each analysis/file
  columnSchema: {
    columnName: string;
    dataType: string;
    description: string;
  }[];
  dataSummary: string;
  tableName: string;
  fileName: string;
  sampleRowsCsv: string;
};
