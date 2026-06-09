export interface ExpoFile {
  path: string;
  language: string;
  description: string;
  code: string;
}

export const EXPO_PROJECT_FILES: ExpoFile[] = [
  {
    path: "package.json",
    language: "json",
    description: "Configuração do projeto Expo, dependências e scripts de execução.",
    code: `{
  "name": "expo-supabase-calculator",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.8",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/bottom-tabs": "^6.5.20",
    "@react-navigation/native-stack": "^6.9.26",
    "expo": "~51.0.0",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.1",
    "react-native-safe-area-context": "4.10.1",
    "react-native-screens": "3.31.1",
    "lucide-react-native": "^0.379.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "~5.3.3"
  },
  "private": true
}`
  },
  {
    path: "src/services/supabase.ts",
    language: "typescript",
    description: "Inicialização do cliente do Supabase com tratamento seguro de sessão.",
    code: `import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_SUPABASE_URL_AQUI';
const supabaseAnonKey = 'SUA_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});`
  },
  {
    path: "src/context/AuthContext.tsx",
    language: "tsx",
    description: "Gerenciamento global de autenticação e sessão com Supabase Auth.",
    code: `import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Ouvir mudanças na autenticação (login, logout, token alterado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);`
  },
  {
    path: "src/navigation/AppNavigator.tsx",
    language: "tsx",
    description: "Configuração do React Navigation controlando rotas públicas e protegidas.",
    code: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { Calculator, History, User } from 'lucide-react-native';

// Telas
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTitleStyle: { fontWeight: 'bold', color: '#1e293b' },
      }}
    >
      <Tab.Screen 
        name="Calculadora" 
        component={CalculatorScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Calculator color={color} size={size} />,
          headerTitle: 'Calculadora Moderna',
        }}
      />
      <Tab.Screen 
        name="Histórico" 
        component={HistoryScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
          headerTitle: 'Histórico de Cálculos',
        }}
      />
      <Tab.Screen 
        name="Perfil" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerTitle: 'Perfil do Usuário',
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          // Rotas Protegidas
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          // Rotas Públicas
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}`
  },
  {
    path: "src/screens/LoginScreen.tsx",
    language: "tsx",
    description: "Tela de entrada para login seguro com e-mail, senha e verificação.",
    code: `import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      Alert.alert('Falha na Autenticação', error.message);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      Alert.alert('Atenção', 'Digite seu e-mail no campo acima para recuperar a senha.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'exp://localhost:19000/--/reset-password',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso', 'E-mail de redefinição enviado! Verifique sua caixa de entrada.');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>CalPro</Text>
        <Text style={styles.subtitle}>Sua calculadora moderna integrada na nuvem</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="exemplo@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
          <Text style={styles.forgotText}>Esqueceu sua senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  form: { width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: { height: 50, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#3b82f6', fontWeight: '500' },
  btnPrimary: { height: 50, backgroundColor: '#3b82f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  btnPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b' },
  registerLink: { color: '#3b82f6', fontWeight: 'bold' },
});`
  },
  {
    path: "src/screens/RegisterScreen.tsx",
    language: "tsx",
    description: "Tela de cadastro para novos usuários com verificação avançada e perfil.",
    code: `import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas devem corresponder!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);

    // 1. Cadastrar usuário no Supabase Auth
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (signupError) {
      Alert.alert('Falha no Cadastro', signupError.message);
      return;
    }

    Alert.alert(
      'Sucesso!', 
      'Seu cadastro foi realizado com sucesso. Verifique seu e-mail se a confirmação estiver ativada!',
      [{ text: 'Entrar', onPress: () => navigation.navigate('Login') }]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Preencha os campos para acessar a calculadora</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui uma conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Fazer Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  form: { width: '100%' },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4 },
  input: { height: 48, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 16, marginBottom: 16, fontSize: 16 },
  btnPrimary: { height: 50, backgroundColor: '#22c55e', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  btnPrimaryText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#64748b' },
  loginLink: { color: '#3b82f6', fontWeight: 'bold' },
});`
  },
  {
    path: "src/screens/CalculatorScreen.tsx",
    language: "tsx",
    description: "Calculadora tátil de alta fidelidade com sincronização e gravação no histórico do Supabase.",
    code: `import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

export default function CalculatorScreen() {
  const [displayValue, setDisplayValue] = useState('0');
  const [equationValue, setEquationValue] = useState('');
  const { user } = useAuth();

  // Função para lidar com cliques nos botões
  function handleTap(type: string, value?: string) {
    if (type === 'number') {
      if (displayValue === '0' || displayValue === 'Erro') {
        setDisplayValue(value!);
      } else {
        setDisplayValue(displayValue + value!);
      }
    } else if (type === 'operator') {
      const lastChar = displayValue.slice(-1);
      if (['+', '-', '×', '÷', '%'].includes(lastChar)) {
        setDisplayValue(displayValue.slice(0, -1) + value!);
      } else {
        setDisplayValue(displayValue + value!);
      }
    } else if (type === 'clear') {
      setDisplayValue('0');
      setEquationValue('');
    } else if (type === 'equal') {
      try {
        // Substituir operadores pelas operações padrão JS
        let mathExpression = displayValue
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/%/g, '/100');

        // Avaliação básica da expressão de forma segura
        const evalResult = eval(mathExpression);
        const formattedResult = Number(evalResult.toFixed(8)).toString();

        setEquationValue(displayValue + ' =');
        setDisplayValue(formattedResult);

        // Salvar automaticamente no Supabase
        saveToSupabase(displayValue, formattedResult);
      } catch (err) {
        setDisplayValue('Erro');
      }
    }
  }

  async function saveToSupabase(expressao: string, resultado: string) {
    if (!user) return;

    try {
      await supabase.from('historico_calculos').insert([
        {
          user_id: user.id,
          expressao: expressao,
          resultado: resultado,
          data_hora: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.log('Erro ao persistir no Supabase:', error);
    }
  }

  const buttons = [
    [ { label: 'C', type: 'clear', bg: '#e2e8f0', color: '#0f172a' }, { label: '÷', type: 'operator', bg: '#f97316', color: '#ffffff' } ],
    [ { label: '7', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '8', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '9', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '×', type: 'operator', bg: '#f97316', color: '#ffffff' } ],
    [ { label: '4', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '5', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '6', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '-', type: 'operator', bg: '#f97316', color: '#ffffff' } ],
    [ { label: '1', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '2', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '3', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '+', type: 'operator', bg: '#f97316', color: '#ffffff' } ],
    [ { label: '0', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '.', type: 'number', bg: '#f1f5f9', color: '#0f172a' }, { label: '%', type: 'operator', bg: '#cbd5e1', color: '#0f172a' }, { label: '=', type: 'equal', bg: '#3b82f6', color: '#ffffff' } ]
  ];

  return (
    <View style={styles.container}>
      <View style={styles.displayArea}>
        <Text style={styles.equationText}>{equationValue}</Text>
        <Text style={styles.displayText} numberOfLines={2} adjustsFontSizeToFit>{displayValue}</Text>
      </View>

      <View style={styles.buttonArea}>
        {buttons.map((row, rIdx) => (
          <View key={rIdx} style={styles.row}>
            {row.map((btn, bIdx) => {
              // Estilo personalizado para botão C e Zero para preencher espaço
              const isHeroButton = btn.label === 'C';
              return (
                <TouchableOpacity
                  key={bIdx}
                  onPress={() => handleTap(btn.type, btn.label)}
                  style={[
                    styles.button, 
                    { backgroundColor: btn.bg },
                    isHeroButton && styles.doubleButton
                  ]}
                >
                  <Text style={[styles.buttonText, { color: btn.color }]}>{btn.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  displayArea: { flex: 1.2, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 24 },
  equationText: { fontSize: 20, color: '#64748b', marginBottom: 8 },
  displayText: { fontSize: 64, fontWeight: '300', color: '#ffffff' },
  buttonArea: { flex: 2.2, backgroundColor: '#1e293b', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 20, justifyContent: 'space-evenly' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  button: { flex: 1, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 1 },
  doubleButton: { flex: 3 },
  buttonText: { fontSize: 24, fontWeight: '600' }
});`
  },
  {
    path: "src/screens/HistoryScreen.tsx",
    language: "tsx",
    description: "Visão em lista dos cálculos efetuados em conformidade cronológica com Supabase.",
    code: `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Trash2, Smartphone } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

interface Calculo {
  id: string;
  expressao: string;
  resultado: string;
  data_hora: string;
}

export default function HistoryScreen() {
  const [history, setHistory] = useState<Calculo[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('historico_calculos')
      .select('*')
      .eq('user_id', user.id)
      .order('data_hora', { ascending: false });

    if (error) {
      console.log('Erro ao baixar histórico', error);
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  }

  async function deleteItem(id: string) {
    const { error } = await supabase
      .from('historico_calculos')
      .delete()
      .eq('id', id);

    if (error) {
      Alert.alert('Erro', 'Não foi possível excluir o item.');
    } else {
      setHistory(history.filter(item => item.id !== id));
    }
  }

  async function clearHistory() {
    if (history.length === 0) return;
    
    Alert.alert(
      'Limpar Histórico', 
      'Você tem certeza de que deseja apagar absolutamente todos os seus cálculos gravados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Limpar Tudo', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase
              .from('historico_calculos')
              .delete()
              .eq('user_id', user?.id);

            setLoading(false);
            if (error) {
              Alert.alert('Erro', 'Ocorreu um erro ao limpar o histórico.');
            } else {
              setHistory([]);
            }
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.countText}>{history.length} cálculos registrados</Text>
        <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
          <Text style={styles.clearBtnText}>Apagar Tudo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : history.length === 0 ? (
        <View style={styles.centered}>
          <Smartphone size={48} color="#94a3b8" />
          <Text style={styles.emptyText}>Nenhum cálculo salvo ainda.</Text>
          <Text style={styles.emptySub}>Suas operações serão listadas aqui em tempo real.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.calcDetails}>
                <Text style={styles.expression}>{item.expressao}</Text>
                <Text style={styles.result}>= {item.resultado}</Text>
                <Text style={styles.date}>
                  {new Date(item.data_hora).toLocaleString('pt-BR')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteBtn}>
                <Trash2 size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderColor: '#e2e8f0' },
  countText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  clearBtn: { padding: 8 },
  clearBtnText: { color: '#ef4444', fontWeight: 'bold', fontSize: 14 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#64748b', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 6 },
  list: { padding: 12 },
  card: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', justifyContent: 'space-between', alignItems: 'center' },
  calcDetails: { flex: 1 },
  expression: { fontSize: 16, color: '#334155' },
  result: { fontSize: 20, fontWeight: 'bold', color: '#0f172a', marginVertical: 4 },
  date: { fontSize: 11, color: '#94a3b8' },
  deleteBtn: { padding: 8, justifyContent: 'center', alignItems: 'center' },
});`
  },
  {
    path: "src/screens/ProfileScreen.tsx",
    language: "tsx",
    description: "Painel de controle de perfil do usuário para ajuste de segurança e desconexão.",
    code: `import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  async function handlePasswordChange() {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas devem corresponder!');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve possuir pelo menos 6 caracteres.');
      return;
    }

    setUpdating(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setUpdating(false);

    if (error) {
      Alert.alert('Erro', error.message);
    } else {
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setNewPassword('');
      setConfirmPassword('');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.user_metadata?.full_name || 'Usuário do CalPro'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Segurança & Conta</Text>
        <Text style={styles.label}>Alterar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmar Nova Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirme a nova senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.updateBtn} onPress={handlePasswordChange} disabled={updating}>
          {updating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.updateBtnText}>Redefinir Senha</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  userCard: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#ffffff' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  email: { fontSize: 14, color: '#64748b', marginTop: 4 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '600', color: '#64748b', marginBottom: 6 },
  input: { height: 44, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, paddingHorizontal: 12, marginBottom: 14, fontSize: 15 },
  updateBtn: { height: 44, backgroundColor: '#3b82f6', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  updateBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 15 },
  logoutBtn: { height: 50, borderRadius: 12, borderWidth: 1.5, borderColor: '#ef4444', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
});`
  },
  {
    path: "supabase-schema.sql",
    language: "sql",
    description: "Script oficial PostgreSQL para inicializar a tabela e políticas de segurança RLS no Supabase.",
    code: `-- 1. Criar a tabela 'historico_calculos' para guardar dados persistidos vinculados aos usuários
CREATE TABLE public.historico_calculos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    expressao TEXT NOT NULL,
    resultado TEXT NOT NULL,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar a segurança no nível de linha (Row Level Security - RLS)
ALTER TABLE public.historico_calculos ENABLE ROW LEVEL SECURITY;

-- 3. Criar política que autoriza os usuários a visualizarem apenas seus próprios cálculos salvos
CREATE POLICY "Usuários podem visualizar seus próprios cálculos"
    ON public.historico_calculos FOR SELECT
    USING (auth.uid() = user_id);

-- 4. Criar política que autoriza os usuários a inserirem os novos cálculos associados a si mesmos
CREATE POLICY "Usuários podem inserir seus próprios cálculos"
    ON public.historico_calculos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 5. Criar política para os usuários deletarem seus próprios dados de cálculos
CREATE POLICY "Usuários podem excluir seus próprios cálculos"
    ON public.historico_calculos FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Criar índice performático focado na otimização de busca rápida por usuário e ordenação cronológica
CREATE INDEX idx_historico_calculos_userid_data 
    ON public.historico_calculos (user_id, data_hora DESC);`
  }
];
