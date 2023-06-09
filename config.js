/* Output directory name */
export const DistDir = "dist";
/* Source directory name */
export const SrcDir = "src";

/* 
  Assets
  your assets here's order here will affect the final output
 */
export const Assets = {
  styles: [
    // put styles here
    "main.scss",
  ],
  scripts: [
    // put scripts here
    "main.js",
  ],
};

export const Paths = {
  styles: {
    src: Assets.styles.map(style => `src/assets/styles/${style}`),
    dest: DistDir + "/assets/css",
  },
  scripts: {
    src: Assets.scripts.map(script => `src/assets/scripts/${script}`),
    dest: DistDir + "/assets/js",
  },
  images: {
    src: "src/assets/images/**/*.{jpg,jpeg,png,svg,gif}",
    dest: DistDir + "/assets/images",
  },
  other: {
    src: ["src/**/*", "!src/assets/{images,scripts,styles}", "!src/assets/{images,scripts,styles}/**/*"],
    dest: DistDir,
  },
  dist: {
    src: [`${DistDir}/**/*`],
    dest: ".zip",
  },
};
