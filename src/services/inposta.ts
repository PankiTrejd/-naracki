import axios from 'axios';

const INPOSTA_API_URL = 'https://inpostaradeski.mk/api/v1';
const INPOSTA_TOKEN = 'SFMyNTY.g2gDYgAADTJuBgDed1PblgFiAAFRgA.xpXhTNFhpzhFGVH3yPxeB-t_EsQhZGbCCB8XOer99t4';

// Types
export interface InpostaAddress {
  name: string;
  city: string;
  phone_number: string;
  address: string;
}

export interface InpostaShipment {
  shipment_type: 'Пакети' | 'Писма' | 'Габаритни пратки' | 'Гуми' | 'Специјални пратки';
  shipment_type_value: string;
  receiver: InpostaAddress;
  sender?: InpostaAddress;
  package_value: number;
  number_packages: number;
  shipping_payment_method: string;
  order_number?: string;
  note?: string;
  reference?: string;
  commission_payment_method?: string;
  return_document?: boolean;
  return_confirmation?: boolean;
  can_open?: boolean;
}

export interface InpostaShipmentResponse {
  message: string;
  shipment: {
    can_open: boolean;
    commission_payment_method: string;
    number_of_packages: number;
    order_number: string;
    package_value: string;
    paid_ransom: boolean;
    ransom_code: string | null;
    receiver: InpostaAddress;
    sender: InpostaAddress;
    reference: string;
    shipment_cost: string;
    shipping_payment_method: string;
    status: string;
    status_id: number;
    link: string;
    courier_notes: Array<{
      id: number;
      courier_name: string;
      inserted_at: string;
      note: string;
    }>;
  };
}

// API Client
const inpostaClient = axios.create({
  baseURL: INPOSTA_API_URL,
  headers: {
    'Authorization': `Bearer ${INPOSTA_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
inpostaClient.interceptors.request.use(request => {
  console.log('InPosta API Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
inpostaClient.interceptors.response.use(
  response => {
    console.log('InPosta API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('InPosta API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// API Methods
export const inpostaService = {
  // Create a single shipment
  createShipment: async (shipment: InpostaShipment): Promise<InpostaShipmentResponse> => {
    const response = await inpostaClient.post('/shipments', shipment);
    return response.data;
  },

  // Create multiple shipments
  createMultipleShipments: async (shipments: InpostaShipment[]): Promise<{ message: string; shipments: InpostaShipmentResponse['shipment'][] }> => {
    const response = await inpostaClient.post('/shipments', shipments);
    return response.data;
  },

  // List shipments by references
  listShipments: async (references: string[]): Promise<InpostaShipmentResponse['shipment'][]> => {
    const response = await inpostaClient.post('/list_shipments', { references });
    return response.data;
  },

  // Update a shipment
  updateShipment: async (reference: string, shipment: InpostaShipment): Promise<InpostaShipmentResponse> => {
    const response = await inpostaClient.put(`/shipments/${reference}`, shipment);
    return response.data;
  },

  // Delete a shipment
  deleteShipment: async (reference: string): Promise<{ message: string }> => {
    const response = await inpostaClient.delete(`/shipments/${reference}`);
    return response.data;
  },
}; 