import React, { useEffect, useState, useRef } from 'react';
import styles from './style.less'

interface iStyle {
  position: any,
  left: number,
  top: number
}

interface IProps {
  children: any,
}

const ContextMenu = (props: IProps) => {
  const { children } = props;
  const [show, setShow] = useState<boolean>(false);
  const [style, setStyle] = useState<iStyle>({ position: 'fixed', left: 300, top: 200 });
  const showRef = useRef(false);
  const rightClickRef = useRef<any>();

  const handleContextMenu = (event: any) => {
    event.preventDefault();
    if (!event.target.className.includes('rightContextMenu')) return;
    setShow(true);
    let { clientX, clientY } = event;
    setStyle({
      ...style,
      left: clientX,
      top: clientY
    });
  };

  const handleClick = (event: any) => {
    if (!showRef.current) return;
    if (event.target.parentNode !== rightClickRef.current) {
      setShow(false)
    }
  };

  const setShowFalse = () => {
    if (!showRef.current) return;
    setShow(false)
  };

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('scroll', setShowFalse, true);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('scroll', setShowFalse, true);
    }
  }, []);

  useEffect(() => {
    showRef.current = show;
  }, [show]);

  const renderContentMenu = () => (
    <div ref={rightClickRef as any} className={styles.contextMenuWrap} style={style} >
      {children}
    </div>
  );
  return show ? renderContentMenu() : null;
};

export default React.memo(ContextMenu);
