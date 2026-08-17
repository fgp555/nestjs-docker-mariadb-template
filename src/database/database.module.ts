import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'nestjs'),
        password: config.get<string>('DB_PASSWORD', 'nestjs'),
        database: config.get<string>('DB_DATABASE', 'nestjs_db'),
        autoLoadEntities: true,
        // Solo para desarrollo: crea/actualiza las tablas automáticamente.
        // En producción usa migraciones y desactiva esto (DB_SYNCHRONIZE=false).
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        // logging: config.get<string>('NODE_ENV') !== 'production',
        retryAttempts: 10,
        retryDelay: 3000,
      }),
    }),
  ],
})
export class DatabaseModule {}
