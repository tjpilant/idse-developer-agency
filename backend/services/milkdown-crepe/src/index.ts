import { buildServer } from './server';
import { config } from './config';
import { configureRoleProvider } from './services/roles';

async function main(){
  if (config.ROLE_PROVIDER === 'file') {
    await configureRoleProvider({
      mode: 'file',
      workspaceRoot: config.WORKSPACE_ROOT,
    });
  } else if (
    config.ROLE_PROVIDER === 'supabase' &&
    config.SUPABASE_URL &&
    config.SUPABASE_SERVICE_ROLE_KEY
  ) {
    await configureRoleProvider({
      mode: 'supabase',
      supabaseUrl: config.SUPABASE_URL,
      supabaseKey: config.SUPABASE_SERVICE_ROLE_KEY,
    });
  } else if (config.ROLE_PROVIDER === 'static' && config.ROLE_MAP) {
    try {
      const map = JSON.parse(config.ROLE_MAP) as Record<string, any>;
      await configureRoleProvider({
        mode: 'static',
        staticMap: map as Record<string, any>,
      });
    } catch (err) {
      console.error('Failed to parse ROLE_MAP JSON, falling back to memory provider', err);
      await configureRoleProvider({ mode: 'memory' });
    }
  } else {
    await configureRoleProvider({ mode: 'memory' });
  }

  const server = buildServer();
  try{
    await server.listen({ port: config.PORT, host: '0.0.0.0' });
    console.log('milkdown-crepe service listening');
  }catch(err){
    server.log.error(err);
    process.exit(1);
  }
}

main();
