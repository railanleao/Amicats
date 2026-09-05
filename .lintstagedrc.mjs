export default {
  "codigo-fonte/web/**/*.{js,jsx,ts,tsx}": (files) => [
    `npm --prefix codigo-fonte/web run lint -- --fix ${files.join(" ")}`,
    `prettier --write ${files.join(" ")}`,
  ],
  "codigo-fonte/mobile/**/*.{js,jsx,ts,tsx}": (files) => [
    `npm --prefix codigo-fonte/mobile run lint -- --fix ${files.join(" ")}`,
    `prettier --write ${files.join(" ")}`,
  ],
  "codigo-fonte/{web,mobile}/**/*.{json,css,md}": "prettier --write",
  "codigo-fonte/backend/**/*.java": () =>
    "./codigo-fonte/backend/mvnw -f codigo-fonte/backend/pom.xml spotless:apply",
};
