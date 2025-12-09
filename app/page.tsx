"use client";
import { Header } from "@/components/Header";
import { JsonFormsDemo } from "@/components/JsonFormDemo";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";

const theme = createTheme({
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          margin: "0.8em 0",
        },
      },
    },
  },
});

export default function HomePage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header />
      <JsonFormsDemo />
    </ThemeProvider>
  );
}
