
export const toolbar = ['heading', '|', 'fontSize', '|', 'alignment', '|', 'fontColor', 'fontBackgroundColor', '|', 'bold', 'italic', 'strikethrough', 'underline', 'subscript', 'superscript', '|', 'link', '|', 'outdent', 'indent', '|', 'bulletedList', 'numberedList', 'todoList', '|', 'code', 'codeBlock', '|', 'insertTable', '|',
  "uploadImage", '|',
  'blockQuote', '|', 'undo', 'redo']

export const simpleToobar = ['fontSize', 'bold', 'italic', 'fontColor', 'fontBackgroundColor', 'bulletedList', 'numberedList']

export const heading = {
  options: [
    { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
    { model: 'heading1', view: 'h1', title: '标题1', class: 'ck-heading_heading1' },
    { model: 'heading2', view: 'h2', title: '标题2', class: 'ck-heading_heading2' },
    { model: 'heading3', view: 'h3', title: '标题3', class: 'ck-heading_heading3' },
    { model: 'heading4', view: 'h4', title: '标题4', class: 'ck-heading_heading4' },
    { model: 'heading5', view: 'h5', title: '标题5', class: 'ck-heading_heading5' },
    { model: 'heading6', view: 'h6', title: '标题6', class: 'ck-heading_heading6' }
  ]
}

export const fontSize = {
  options: [
    12,
    14,
    16,
    18,
    20,
    26,
    30,
    40,
  ]
}

const commonColor = [
  {
    color: '#000',
    label: ''
  },
  {
    color: '#4d4d4d',
    label: ''
  },
  {
    color: '#999999',
    label: ''
  },
  {
    color: '#e6e6e6',
    label: ''
  },
  {
    color: '#fff',
    label: '',
    hasBorder: true
  },
  {
    color: '#e64c4c',
    label: ''
  },
  {
    color: '#e6994c',
    label: ''
  },
  {
    color: '#e6e64c',
    label: ''
  },
  {
    color: '#99e64c',
    label: ''
  },
  {
    color: '#4ce64c',
    label: ''
  },
  {
    color: '#4ce699',
    label: ''
  },
  {
    color: '#4ce6e6',
    label: ''
  },
  {
    color: '#4c99e6',
    label: ''
  },
  {
    color: '#4c4ce6',
    label: ''
  },
  {
    color: '#994ce6',
    label: ''
  },
  // More colors.
  // ...
]

export const fontColor = {
  colors: commonColor
}

export const fontBackgroundColor = {
  colors: commonColor
}


export const tableProperties = {
  backgroundColors: commonColor,
  borderColors: commonColor
}


export const tableCellProperties = {
  backgroundColors: commonColor,
  borderColors: commonColor
}