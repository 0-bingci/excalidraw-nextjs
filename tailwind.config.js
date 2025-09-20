/** @type {import('tailwindcss').Config} */
module.exports = {
  // 关键：指定需要扫描的文件路径（Tailwind 根据这些文件中的类名生成样式）
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // 扫描 src/app 下的所有文件
    "./src/components/**/*.{js,ts,jsx,tsx}", // 若有 components 目录也需包含
  ],
  theme: {
    extend: {
      // 这里可以自定义颜色、字体、间距等（可选）
      colors: {
        primary: "#165DFF", // 示例：添加自定义主色调
      },
    },
  },
  plugins: [
    // 可以添加 Tailwind 插件（如 @tailwindcss/forms）
  ],
};