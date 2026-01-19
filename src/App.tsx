import "./App.css";
import { PrimeReactProvider } from "primereact/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ArtWork from "./component/ArtWork";
import { BrowserRouter } from "react-router-dom";

const queryClient = new QueryClient();
function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <PrimeReactProvider>
          <BrowserRouter>
            <ArtWork />
          </BrowserRouter>
        </PrimeReactProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
