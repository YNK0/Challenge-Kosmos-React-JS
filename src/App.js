import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import "./app.css";

const App = () => {

  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = () => {
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        
        id: Math.floor(Math.random() * 100),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        backgroundImage: "url(https://via.placeholder.com/600/77179)",
      },
    ]);
  };

  

  const updateMoveable = (id, newComponent, updateEnd = true) => {
    const updatedMoveables = moveableComponents.map((moveable) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };



  const handleResizeStart = (index, e) => {
      const [handlePosX, handlePosY] = e.direction;
    if (handlePosX === -1) {
      const initialLeft = e.left;
      const initialWidth = e.width;
    }
  };

  const sizeOfMoveables = () => {
    console.log(moveableComponents.length);
    return moveableComponents.length<0;
  };

  //Codigo pendiendo aui

  const deleteMoveable = (id) => {
    const updatedMoveables = moveableComponents.filter((moveable) => moveable.id !== selected);
    setMoveableComponents(updatedMoveables);
  };
  
  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <div className="container-btns">
      <button onClick={addMoveable} className="button-4">Add Moveable</button>
      <button onClick={deleteMoveable} className={selected == null ? "ocult": "" + moveableComponents.length==0 ? "ocult" : "" + "button-4"}>Remove Moveable</button>
      </div>
      <div 
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (          
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected }
            isSelected={selected === item.id  }
            
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  button,
  right,
  width,
  height,
  index,
  color,
  moveableComponents,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  backgroundImage,
}) => {
  const ref = useRef();
  const parentRef = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top: top,
    left: left,
    button: button,
    right: right,
    width,
    height,
    index,
    color,
    backgroundImage,
    moveableComponents,
    id,
  });

  useEffect(() => {
    parentRef.current = ref.current.parentElement;
  }, []);

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const onResize = async (e) => {
    //Medidas del contenedor padre
    const parentBounds = parentRef.current.getBoundingClientRect();

    //Verificar si el componente se sale del contenedor
    if (e.left < parentBounds.left) {
      e.left = parentBounds.left;
    }
    if (e.top < parentBounds.top) {
      e.top = parentBounds.top;
    }


    // limites del componente
    const minWidth = 50;
    const minHeight = 50;
    const maxWidth = parentBounds.width;
    const maxHeight = parentBounds.height ;


    //nuevo tamaño
    let newWidth = e.width;
    let newHeight = e.height;

    // Verifica si el nuevo ancho y alto están dentro de los límites
    if (newWidth < minWidth) {
      newWidth = minWidth;
    } else if (newWidth > maxWidth) {
      newWidth = maxWidth;
    }

    if (newHeight < minHeight) {
      newHeight = minHeight;
    } else if (newHeight > maxHeight) {
      newHeight = maxHeight;
    }

    updateMoveable(id, {
      top: e.top,
      left: e.left,
      width,
      height,
      color,
      moveableComponents,
      backgroundImage,
    });

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${newWidth}px`;
    ref.current.style.height = `${newHeight}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    if (e.left + translateX < parentBounds.left)
    translateX = parentBounds.left - e.left;
  if (e.top + translateY < parentBounds.top)
    translateY = parentBounds.top - e.top;

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      top: e.top,
      left: e.left, 
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    
    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;
  
    if (positionMaxTop > parentBounds?.height) {
      newHeight = parentBounds?.height - top;
      newWidth = (newHeight / height) * width;
    }
    if (positionMaxLeft > parentBounds?.width) {
      newWidth = parentBounds?.width - left;
      newHeight = (newWidth / width) * height;
    }
  
    
    updateMoveable(
      id,
      {
        top: 0,
        left: 0,
        width: newWidth,
        height: newHeight,
        color,
        moveableComponents,
        backgroundImage,
      },
      true
    );
  
    setNodoReferencia({
      ...nodoReferencia,
      top: 0,
      left: 0,
    });
  };

  const handleContextMenu = (event, id) => {
    event.preventDefault(); 

  };

  //console.log(imgList[Math.floor(Math.random() * id)].url)
  //console.log(Math.floor(0.00000000001 * id))

  const [data, setData] = useState(null);

  useEffect(() => {
      fetch('https://jsonplaceholder.typicode.com/photos')
        .then(response => response.json())
        .then(data => setData(data));
  }, []);

  function getImg (id) {
    if(data==null) return null;
    return data[id].url
  }
  return (
    <>
      <div
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,  
          backgroundSize: width+"px" + " " + height+"px",
          backgroundImage: `url(${getImg(id)}})`,
        }}
        onClick={() => setSelected(id)}
        onContextMenu={handleContextMenu}

      >
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          if(e.top < 0){
            e.top=0;
          }
          if(e.left < 0){
            e.left=0;
          }
          if(e.bottom < 0){
            e.top=parentRef.current.offsetHeight-height;
          }
          if(e.right <= 0){
            e.left=parentRef.current.offsetWidth-width;
          }
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            button: e.bottom,
            right: e.right,
            width,
            height,
            color,
            backgroundImage,
          });
        }}
        
        onResize={onResize}
        onResizeEnd={(e) => {
          onResizeEnd(e);
        }}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
        onContextMenu={handleContextMenu}
      />
    </>
  );
};