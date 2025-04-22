interface EthereumProvider {
    request: (...args: any[]) => Promise<any>;
    on?: (...args: any[]) => void;
    removeListener?: (...args: any[]) => void;
  }
  
  interface Window {
    ethereum?: EthereumProvider;
  }