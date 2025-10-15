import { type MultiSelectOption } from "@/components/multi-select-optimized";

// Lazy-loaded UI components data for better performance
export const UI_COMPONENTS_OPTIONS: MultiSelectOption[] = [
  // Component Libraries
  { value: "shadcn/ui", label: "shadcn/ui" },
  { value: "Radix UI", label: "Radix UI" },
  { value: "Headless UI", label: "Headless UI" },
  { value: "Mantine", label: "Mantine" },
  { value: "Chakra UI", label: "Chakra UI" },
  { value: "Material-UI (MUI)", label: "Material-UI (MUI)" },
  { value: "Ant Design", label: "Ant Design" },
  { value: "Semantic UI", label: "Semantic UI" },
  { value: "React Bootstrap", label: "React Bootstrap" },
  { value: "Reactstrap", label: "Reactstrap" },
  { value: "Blueprint", label: "Blueprint" },
  { value: "Evergreen", label: "Evergreen" },
  { value: "Grommet", label: "Grommet" },
  { value: "Reakit", label: "Reakit" },
  { value: "Bloomer", label: "Bloomer" },
  { value: "PrimeReact", label: "PrimeReact" },
  { value: "KendoReact", label: "KendoReact" },
  { value: "DevExtreme React", label: "DevExtreme React" },
  { value: "Syncfusion React", label: "Syncfusion React" },

  // Design Systems
  { value: "Carbon Design System", label: "Carbon Design System" },
  { value: "Lightning Design System", label: "Lightning Design System" },
  { value: "Clarity Design System", label: "Clarity Design System" },
  { value: "Fluent UI", label: "Fluent UI" },
  { value: "Atlassian Design System", label: "Atlassian Design System" },
  { value: "Nordic Design System", label: "Nordic Design System" },
  { value: "Spectrum", label: "Spectrum" },
  { value: "Polaris", label: "Polaris" },
  { value: "Dawn", label: "Dawn" },
  { value: "Primer", label: "Primer" },
  { value: "Base Web", label: "Base Web" },
  { value: "Gestalt", label: "Gestalt" },

  // CSS Frameworks
  { value: "Tailwind CSS", label: "Tailwind CSS" },
  { value: "Bootstrap", label: "Bootstrap" },
  { value: "Foundation", label: "Foundation" },
  { value: "Bulma", label: "Bulma" },
  { value: "Pure CSS", label: "Pure CSS" },
  { value: "Semantic UI CSS", label: "Semantic UI CSS" },
  { value: "UIKit", label: "UIKit" },
  { value: "Skeleton", label: "Skeleton" },
  { value: "Milligram", label: "Milligram" },
  { value: "Tachyons", label: "Tachyons" },
  { value: "Materialize CSS", label: "Materialize CSS" },
  { value: "Vuetify", label: "Vuetify" },
  { value: "Quasar", label: "Quasar" },
  { value: "Element Plus", label: "Element Plus" },
  { value: "iView", label: "iView" },

  // Animation Libraries
  { value: "Framer Motion", label: "Framer Motion" },
  { value: "React Spring", label: "React Spring" },
  { value: "AutoAnimate", label: "AutoAnimate" },
  { value: "React Transition Group", label: "React Transition Group" },
  { value: "GSAP", label: "GSAP" },
  { value: "Lottie", label: "Lottie" },
  { value: "Animate.css", label: "Animate.css" },
  { value: "AOS", label: "AOS" },
  { value: "Wow.js", label: "Wow.js" },
  { value: "Velocity.js", label: "Velocity.js" },

  // Icon Libraries
  { value: "Lucide React", label: "Lucide React" },
  { value: "Heroicons", label: "Heroicons" },
  { value: "React Icons", label: "React Icons" },
  { value: "Font Awesome", label: "Font Awesome" },
  { value: "Material Icons", label: "Material Icons" },
  { value: "Ionicons", label: "Ionicons" },
  { value: "Feather Icons", label: "Feather Icons" },
  { value: "Boxicons", label: "Boxicons" },
  { value: "SVG React", label: "SVG React" },
  { value: "Remix Icon", label: "Remix Icon" },

  // Form Libraries
  { value: "React Hook Form", label: "React Hook Form" },
  { value: "Formik", label: "Formik" },
  { value: "Final Form", label: "Final Form" },
  { value: "React Final Form", label: "React Final Form" },
  { value: "Redux Form", label: "Redux Form" },
  { value: "FormBuilder", label: "FormBuilder" },
  { value: "React-jsonschema-form", label: "React-jsonschema-form" },

  // Data Visualization
  { value: "Chart.js", label: "Chart.js" },
  { value: "Recharts", label: "Recharts" },
  { value: "Nivo", label: "Nivo" },
  { value: "Victory", label: "Victory" },
  { value: "D3.js", label: "D3.js" },
  { value: "Plotly.js", label: "Plotly.js" },
  { value: "ApexCharts", label: "ApexCharts" },
  { value: "Highcharts", label: "Highcharts" },
  { value: "ECharts", label: "ECharts" },
  { value: "G2", label: "G2" },

  // Calendar & Date Pickers
  { value: "React Calendar", label: "React Calendar" },
  { value: "React Date Picker", label: "React Date Picker" },
  { value: "DayPicker", label: "DayPicker" },
  { value: "FullCalendar", label: "FullCalendar" },
  { value: "BigCalendar", label: "BigCalendar" },
  { value: "Flatpickr", label: "Flatpickr" },
  { value: "Pikaday", label: "Pikaday" },
  { value: "Date-fns", label: "Date-fns" },
  { value: "Moment.js", label: "Moment.js" },
  { value: "Day.js", label: "Day.js" },

  // Tables & Grids
  { value: "React Table", label: "React Table" },
  { value: "AG Grid", label: "AG Grid" },
  { value: "DataTables", label: "DataTables" },
  { value: "React Grid", label: "React Grid" },
  { value: "React Virtualized", label: "React Virtualized" },
  { value: "React Window", label: "React Window" },
  { value: "TanStack Table", label: "TanStack Table" },
  { value: "React Data Grid", label: "React Data Grid" },

  // Modals & Overlays
  { value: "React Modal", label: "React Modal" },
  { value: "React Dialog", label: "React Dialog" },
  { value: "SweetAlert2", label: "SweetAlert2" },
  { value: "React Hot Toast", label: "React Hot Toast" },
  { value: "React Toastify", label: "React Toastify" },
  { value: "Notistack", label: "Notistack" },
  { value: "React Notification", label: "React Notification" },

  // File Upload
  { value: "React Dropzone", label: "React Dropzone" },
  { value: "Uppy", label: "Uppy" },
  { value: "FilePond", label: "FilePond" },
  { value: "React Fine Uploader", label: "React Fine Uploader" },

  // Text Editors
  { value: "React Quill", label: "React Quill" },
  { value: "Slate", label: "Slate" },
  { value: "Draft.js", label: "Draft.js" },
  { value: "TipTap", label: "TipTap" },
  { value: "CKEditor", label: "CKEditor" },
  { value: "TinyMCE", label: "TinyMCE" },
  { value: "Monaco Editor", label: "Monaco Editor" },
  { value: "CodeMirror", label: "CodeMirror" },
  { value: "Ace Editor", label: "Ace Editor" },

  // Carousels & Sliders
  { value: "Swiper", label: "Swiper" },
  { value: "Slick", label: "Slick" },
  { value: "React Slick", label: "React Slick" },
  { value: "Embla Carousel", label: "Embla Carousel" },
  { value: "Flickity", label: "Flickity" },
  { value: "Splide", label: "Splide" },
  { value: "Siema", label: "Siema" },

  // Color Pickers
  { value: "React Color", label: "React Color" },
  { value: "React Colorful", label: "React Colorful" },
  { value: "Chrome Color Picker", label: "Chrome Color Picker" },
  { value: "Sketch Color Picker", label: "Sketch Color Picker" },
  { value: "Material Picker", label: "Material Picker" },

  // Drag & Drop
  { value: "React DnD", label: "React DnD" },
  { value: "Dnd Kit", label: "Dnd Kit" },
  { value: "React Beautiful DnD", label: "React Beautiful DnD" },
  { value: "React Sortable", label: "React Sortable" },
  { value: "Interact.js", label: "Interact.js" },

  // Virtual Reality & 3D
  { value: "React Three Fiber", label: "React Three Fiber" },
  { value: "A-Frame React", label: "A-Frame React" },
  { value: "Babylon.js", label: "Babylon.js" },
  { value: "React 360", label: "React 360" },

  // Mobile UI
  { value: "Ionic React", label: "Ionic React" },
  { value: "Onsen UI", label: "Onsen UI" },
  { value: "Framework7 React", label: "Framework7 React" },
  { value: "React Native Web", label: "React Native Web" },

  // Specialized Components
  { value: "React Flow", label: "React Flow" },
  { value: "React Force Graph", label: "React Force Graph" },
  { value: "React Organizational Chart", label: "React Organizational Chart" },
  { value: "React Timeline", label: "React Timeline" },
  { value: "React Step Progress", label: "React Step Progress" },
  { value: "React Rater", label: "React Rater" },
  { value: "React Rating", label: "React Rating" },
  { value: "React Syntax Highlighter", label: "React Syntax Highlighter" },
  { value: "React Markdown", label: "React Markdown" },
  { value: "React Latex", label: "React Latex" },
];

// Categories for better organization
export const UI_COMPONENTS_CATEGORIES = {
  libraries: {
    label: "Component Libraries",
    options: UI_COMPONENTS_OPTIONS.filter(opt =>
      ["shadcn/ui", "Radix UI", "Headless UI", "Mantine", "Chakra UI", "Material-UI (MUI)", "Ant Design", "Semantic UI", "React Bootstrap", "Reactstrap", "Blueprint", "Evergreen", "Grommet", "Reakit", "Bloomer", "PrimeReact", "KendoReact", "DevExtreme React", "Syncfusion React"].includes(opt.value)
    )
  },
  designSystems: {
    label: "Design Systems",
    options: UI_COMPONENTS_OPTIONS.filter(opt =>
      ["Carbon Design System", "Lightning Design System", "Clarity Design System", "Fluent UI", "Atlassian Design System", "Nordic Design System", "Spectrum", "Polaris", "Dawn", "Primer", "Base Web", "Gestalt"].includes(opt.value)
    )
  },
  cssFrameworks: {
    label: "CSS Frameworks",
    options: UI_COMPONENTS_OPTIONS.filter(opt =>
      ["Tailwind CSS", "Bootstrap", "Foundation", "Bulma", "Pure CSS", "Semantic UI CSS", "UIKit", "Skeleton", "Milligram", "Tachyons", "Materialize CSS", "Vuetify", "Quasar", "Element Plus", "iView"].includes(opt.value)
    )
  },
  animation: {
    label: "Animation Libraries",
    options: UI_COMPONENTS_OPTIONS.filter(opt =>
      ["Framer Motion", "React Spring", "AutoAnimate", "React Transition Group", "GSAP", "Lottie", "Animate.css", "AOS", "Wow.js", "Velocity.js"].includes(opt.value)
    )
  },
  icons: {
    label: "Icon Libraries",
    options: UI_COMPONENTS_OPTIONS.filter(opt =>
      ["Lucide React", "Heroicons", "React Icons", "Font Awesome", "Material Icons", "Ionicons", "Feather Icons", "Boxicons", "SVG React", "Remix Icon"].includes(opt.value)
    )
  }
} as const;