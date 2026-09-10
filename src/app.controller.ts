import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Pedidos')
@Controller('api/pedidos')
export class AppController {

  @Get('mock/PROMO-2002')
  @ApiOperation({ summary: 'Obtener cabecera y resumen del pedido real PROMO 2002' })
  @ApiResponse({ status: 200, description: 'Datos simulados para Frontend' })
  getPedidoMock() {
    return {
      codigo: 'SUB-00842',
      cliente: 'Promoción 2002 San José',
      estado: 'CONFIRMADO',
      fechaPedido: '2026-09-01',
      fechaCompromiso: '2026-09-15',
      colores: [
        { nombre: 'Blanco Hueso', hex: '#F7F4F2' },
        { nombre: 'Dorado', hex: '#CC9933' },
      ],
      resumenProduccion: {
        totalConjuntos: 17,
        totalCamisetas: 11,
        totalPrendasFisicas: 28,
        totalShorts: 17,
        totalMedias: 17,
      },
    };
  }

  @Get('mock/PROMO-2002/prendas')
  @ApiOperation({ summary: 'Obtener listado de las 28 prendas con tallas y dorsales' })
  @ApiResponse({ status: 200, description: 'Listado detallado de prendas' })
  getPrendasMock() {
    return [
      { id: 1,  grupo: 'Titulares', persona: 'CLINT',    numero: '7',   talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 2,  grupo: 'Titulares', persona: 'MATEO',    numero: '10',  talla: 'L', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 3,  grupo: 'Titulares', persona: 'LUCAS',    numero: '9',   talla: 'S', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 4,  grupo: 'Titulares', persona: 'PEDRO',    numero: '3',   talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 5,  grupo: 'Titulares', persona: 'JORGE',    numero: '5',   talla: 'L', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 6,  grupo: 'Titulares', persona: 'RAUL',     numero: '8',   talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 7,  grupo: 'Titulares', persona: 'CARLOS',   numero: '2',   talla: 'S', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 8,  grupo: 'Titulares', persona: 'ANDRES',   numero: '4',   talla: 'L', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 9,  grupo: 'Titulares', persona: 'MIGUEL',   numero: '6',   talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 10, grupo: 'Titulares', persona: 'IVAN',     numero: '1',   talla: 'L', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 11, grupo: 'Titulares', persona: 'DIEGO',    numero: '11',  talla: 'S', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 12, grupo: 'Suplentes', persona: 'JOSE',     numero: '12',  talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 13, grupo: 'Suplentes', persona: 'LUIS',     numero: '13',  talla: 'L', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 14, grupo: 'Suplentes', persona: 'PABLO',    numero: '14',  talla: 'S', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 15, grupo: 'Suplentes', persona: 'OSCAR',    numero: '15',  talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 16, grupo: 'Suplentes', persona: 'FELIX',    numero: '16',  talla: 'L', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 17, grupo: 'Suplentes', persona: 'TOMAS',    numero: '17',  talla: 'M', tipo: 'CONJUNTO',  genero: 'HOMBRE', corte: 'RECTO'    },
      { id: 18, grupo: 'Damas',     persona: 'ANA',      numero: 'S/N', talla: 'S', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 19, grupo: 'Damas',     persona: 'SOFIA',    numero: 'S/N', talla: 'M', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 20, grupo: 'Damas',     persona: 'MARIA',    numero: 'S/N', talla: 'S', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 21, grupo: 'Damas',     persona: 'LAURA',    numero: 'S/N', talla: 'M', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 22, grupo: 'Damas',     persona: 'ELENA',    numero: 'S/N', talla: 'S', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 23, grupo: 'Damas',     persona: 'ROSA',     numero: 'S/N', talla: 'L', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 24, grupo: 'Damas',     persona: 'IRENE',    numero: 'S/N', talla: 'M', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 25, grupo: 'Damas',     persona: 'CLARA',    numero: 'S/N', talla: 'S', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 26, grupo: 'Damas',     persona: 'NORA',     numero: 'S/N', talla: 'M', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 27, grupo: 'Damas',     persona: 'PILAR',    numero: 'S/N', talla: 'L', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
      { id: 28, grupo: 'Damas',     persona: 'LUCIA',    numero: 'S/N', talla: 'S', tipo: 'CAMISETA',  genero: 'MUJER',  corte: 'PRINCESA' },
    ];
  }
}
