import React, { useRef, useState, useEffect, } from "react";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.css";

const Editor = (props: any = {}) => {
  const { mode = 'code' } = props
  const { value, onChange = () => { } } = props;
  const [editor, setEditor] = useState<JSONEditor>();
  const editorRef = useRef();

  useEffect(() => {
    if (value) {
      if (!editor) {
        const newEditor = new JSONEditor(editorRef.current, {
          mode,
          onChange: () => newEditor.get
        });
        newEditor.set(value);
        setEditor(newEditor);
      } else {
        editor.set(value);
      }
    }
  }, [value, editor, onChange]);

  return <div className="common-json-editor" id="jsoneditor" ref={editorRef} />;
};

export default Editor;