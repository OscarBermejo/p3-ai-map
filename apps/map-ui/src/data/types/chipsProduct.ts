/** Flattened view of one product entry from a chips-layer `business/business.yaml` for comparison tables. */
export type ChipsProductView = {
  name: string;
  vendor: string;
  generation: string | null;
  status: string | null;

  memoryType: string | null;
  memoryTypeNotes: string | null;
  memoryCapacityGb: number | null;
  memoryCapacityGbNotes: string | null;
  memoryBandwidthTbS: number | null;
  memoryBandwidthTbSNotes: string | null;

  tdpWatts: number | null;
  tdpWattsNotes: string | null;
  peakFlopsFp8Tflops: number | null;
  peakFlopsFp8TflopsNotes: string | null;
  peakFlopsFp16Tflops: number | null;
  peakFlopsFp16TflopsNotes: string | null;
  peakFlopsFp32Tflops: number | null;
  peakFlopsFp32TflopsNotes: string | null;

  flopsPerWattFp8: number | null;
  flopsPerWattFp8Notes: string | null;

  interconnect: string | null;
  interconnectNotes: string | null;

  workloadTraining: string | null;
  workloadTrainingNotes: string | null;
  workloadInference: string | null;
  workloadInferenceNotes: string | null;
  workloadFineTuning: string | null;
  workloadFineTuningNotes: string | null;
};
