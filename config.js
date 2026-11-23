window.SITE = {
  nome: "Detetive Silva",

  whatsapp: {
    numero: "5561982269210", // só dígitos, ex.: 5511999998888
    mensagem: "Olá! Gostaria de falar com a Detetive Silva sobre um caso.",
  },

  contato: {
    email: "peritaelida@gmail.com",
    // Opcional: chave do Web3Forms (https://web3forms.com). Se vazio, usa FormSubmit.
    web3formsChave: "",
    assunto: "Novo contato pelo site Detetive Silva",
  },

  frames: {
    total: 160, // valor impresso pelo fatiar_frames.sh
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },

  // Segunda cena (vigilância), 120 quadros
  frames2: {
    total: 120,
    desktop: "assets/frames2/desktop/f_{n}.webp",
    mobile: "assets/frames2/mobile/f_{n}.webp",
  },
};
