import { Layout } from "./components/Layout";
import { LayersMapView } from "./features/layers/LayersMapView";

export function App() {
  return (
    <Layout>
      <LayersMapView />
    </Layout>
  );
}
