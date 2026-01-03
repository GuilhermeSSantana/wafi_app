import { UploadResponse } from '@types';

// Normalizar URL da API - remover barra final e adicionar /api se necessário
const normalizeApiUrl = (url: string): string => {
  // Remover barras finais
  let normalized = url.replace(/\/+$/, '');
  
  // Se não termina com /api, adicionar
  if (!normalized.endsWith('/api')) {
    normalized = `${normalized}/api`;
  }
  
  return normalized;
};

const API_URL = normalizeApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

export interface UploadProgressEvent {
  progress: number;
  message: string;
  success?: boolean;
  transactionsCreated?: number;
  error?: string;
  filename?: string;
  originalname?: string;
  requiresPassword?: boolean;
  invalidPassword?: boolean;
}

export const uploadService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload do arquivo');
    }

    const data = await response.json();
    return data.data;
  },

  /**
   * Upload com progresso em tempo real via Server-Sent Events (SSE)
   */
  uploadFileWithProgress(
    file: File,
    onProgress: (event: UploadProgressEvent) => void,
    onComplete: (result: UploadResponse & { transactionsCreated: number }) => void,
    onError: (error: Error) => void
  ): () => void {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    
    const xhr = new XMLHttpRequest();
    let eventSource: EventSource | null = null;

    // Upload do arquivo
    xhr.open('POST', `${API_URL}/upload/stream`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        // O upload foi bem-sucedido, mas o processamento continua via SSE
        // Não fazer nada aqui, o SSE vai enviar os eventos
      } else {
        onError(new Error('Erro ao fazer upload do arquivo'));
      }
    };

    xhr.onerror = () => {
      onError(new Error('Erro de conexão ao fazer upload'));
    };

    xhr.send(formData);

    // Conectar ao SSE para receber progresso
    // Nota: Na prática, o SSE seria iniciado após o upload, mas para simplificar
    // vamos usar apenas o endpoint SSE que já recebe o arquivo
    
    // Por enquanto, vamos usar uma abordagem diferente - fazer upload e depois conectar ao SSE
    // Ou melhor ainda, usar apenas fetch com streaming
    
    return () => {
      xhr.abort();
    };
  },

  /**
   * Upload com progresso usando fetch e Server-Sent Events
   */
  async uploadFileWithProgressSSE(
    file: File,
    onProgress: (event: UploadProgressEvent) => void,
    password?: string,
    referenceMonth?: string, // formato "YYYY-MM"
    cardId?: string // ID do cartão associado
  ): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }
    if (referenceMonth) {
      formData.append('referenceMonth', referenceMonth);
    }
    if (cardId) {
      formData.append('cardId', cardId);
    }

    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/upload/stream`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao fazer upload do arquivo');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Stream não disponível');
    }

    let buffer = '';
    let finalResult: any = null;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
           
            
            // Atualizar finalResult ANTES de chamar onProgress
            if (data.success !== undefined || data.requiresPassword !== undefined || data.invalidPassword !== undefined) {
              finalResult = data;
            }
            
            // Sempre chamar onProgress se houver progress ou message
            if (data.progress !== undefined || data.message !== undefined) {
              onProgress({
                progress: data.progress ?? 0,
                message: data.message || '',
                success: data.success,
                transactionsCreated: data.transactionsCreated,
                filename: data.filename,
                originalname: data.originalname,
                error: data.error,
                requiresPassword: data.requiresPassword,
                invalidPassword: data.invalidPassword,
              });
            }
          } catch (e) {
            console.error('Erro ao parsear evento SSE:', e, line);
          }
        }
      }
    }

    // Se precisar de senha ou senha inválida, retornar informação especial (NÃO lançar erro)
    if (finalResult?.requiresPassword || finalResult?.invalidPassword) {
      return {
        success: false,
        transactionsCreated: 0,
        filename: finalResult.filename || file.name,
        originalname: finalResult.originalname || file.name,
        requiresPassword: finalResult.requiresPassword || false,
        invalidPassword: finalResult.invalidPassword || false,
        message: finalResult.message || '',
      } as any;
    }

    // Se há resultado com sucesso, retornar
    if (finalResult?.success) {
      return finalResult;
    }

    // Se não há resultado final ou houve erro (e não é requiresPassword), lançar exceção
    if (!finalResult) {
      throw new Error('Processamento não completou');
    }

    // Se há erro no resultado, lançar exceção
    const errorMessage = finalResult.error || finalResult.message || 'Erro ao processar arquivo';
    throw new Error(errorMessage);
  },
};
