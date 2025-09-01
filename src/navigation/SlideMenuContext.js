import React, { createContext, useState, useContext } from "react";

// SlideMenu için Context API oluşturalım
const SlideMenuContext = createContext();

/**
 * SlideMenu durum yönetimi için context provider
 * Bu şekilde döngüsel bağımlılık olmadan SlideMenu durumunu yönetebiliriz
 */
export const SlideMenuProvider = ({ children }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(null);

  // SlideMenu'yü açma fonksiyonu
  const openMenu = (screenName) => {
    setCurrentScreen(screenName);
    setMenuVisible(true);
  };

  // SlideMenu'yü kapatma fonksiyonu
  const closeMenu = () => {
    setMenuVisible(false);
  };

  return (
    <SlideMenuContext.Provider
      value={{
        menuVisible,
        currentScreen,
        openMenu,
        closeMenu,
        setMenuVisible,
      }}
    >
      {children}
    </SlideMenuContext.Provider>
  );
};

// SlideMenu durumunu kullanmak için hook
export const useSlideMenu = () => {
  const context = useContext(SlideMenuContext);
  if (!context) {
    throw new Error("useSlideMenu must be used within SlideMenuProvider");
  }
  return context;
};

export default SlideMenuContext;
