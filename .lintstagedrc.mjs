import path from "node:path";

const quote = (files) => files.map((file) => `"${file}"`).join(" ");

const toSpotlessPattern = (file) =>
  ".*" + path.relative(process.cwd(), file).replace(/[\\/.]/g, ".");

export default {
  "codigo-fonte/web/**/*.{js,jsx,ts,tsx}": (files) => [
    `npm --prefix codigo-fonte/web run lint -- --fix ${quote(files)}`,
    `prettier --write ${quote(files)}`,
  ],
  "codigo-fonte/mobile/**/*.{js,jsx,ts,tsx}": (files) => [
    `npm --prefix codigo-fonte/mobile run lint -- --fix ${quote(files)}`,
    `prettier --write ${quote(files)}`,
  ],
  "codigo-fonte/{web,mobile}/**/*.{json,css,html}": (files) =>
    `prettier --write ${quote(files)}`,
  "codigo-fonte/backend/**/*.java": (files) =>
    `./codigo-fonte/backend/mvnw -f codigo-fonte/backend/pom.xml spotless:apply "-DspotlessFiles=${files
      .map(toSpotlessPattern)
      .join(",")}"`,
};
