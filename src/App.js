import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [bgImg, setBgImg] = useState("");
  useEffect(() => {
    async function fetchImage() {
      const response = await fetch("https://jsonplaceholder.typicode.com/photos");
      const data = await response.json();
      setBgImg(data[Math.floor(Math.random() * data.length)].url);
    }
    fetchImage();
  }, []);

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true,
        backgroundImage: bgImg,
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };

  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      
      
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  

  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
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
            setSelected={setSelected}
            isSelected={selected === item.id}
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


    //nuevo tama??o
    let newWidth = e.width;
    let newHeight = e.height;

    // Verifica si el nuevo ancho y alto est??n dentro de los l??mites
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
  
    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;
  
    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];
  
    if (absoluteTop < 0) {
      newHeight = newHeight + absoluteTop;
      absoluteTop = 0;
    }
    if (absoluteLeft < 0) {
      newWidth = newWidth + absoluteLeft;
      absoluteLeft = 0;
    }
  
    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
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
      top: absoluteTop,
      left: absoluteLeft,
    });
  };



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
          background: color,
        }}
        onClick={() => setSelected(id)}

      >
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
          });
        }}
        
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};