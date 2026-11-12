import streamlit as st
import requests
import pandas as pd
import plotly.express as px

# ⚠️ COLOQUE A URL DA SUA API NO RENDER AQUI
API_URL = "https://api-financeira-9ozz.onrender.com/api/v1"

st.set_page_config(page_title="Minhas Finanças", page_icon="💰", layout="centered")
st.title("💰 Minhas Finanças")

# --- 1. GERENCIAMENTO DE SESSÃO (LOGIN) ---
if "token" not in st.session_state:
    st.session_state.token = None
if "user_email" not in st.session_state:
    st.session_state.user_email = None

# ? BLOCO DE CODIGO ATUALIZADO!
def fazer_login(email, senha):
    response = requests.post(
        f"{API_URL}/auth/login",
        data={"username": email, "password": senha}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    return None

# --- 2. TELA DE LOGIN ---
if st.session_state.token is None:
    st.subheader("Faça login para continuar")
    with st.form("login_form"):
        email = st.text_input("E-mail")
        senha = st.text_input("Senha", type="password")
        submitted = st.form_submit_button("Entrar")
        
        if submitted:
            token = fazer_login(email, senha)
            if token:
                st.session_state.token = token
                st.session_state.user_email = email
                st.success("Login realizado com sucesso!")
                st.rerun()
            else:
                st.error("E-mail ou senha incorretos.")
    st.stop() # Para a execução aqui se não estiver logado

# --- 3. INTERFACE LOGADA ---
st.sidebar.write(f"Logado como: **{st.session_state.user_email}**")
if st.sidebar.button("Sair"):
    st.session_state.token = None
    st.session_state.user_email = None
    st.rerun()

headers = {"Authorization": f"Bearer {st.session_state.token}"}

# Formulário para criar transação
st.subheader("Nova Transação")
with st.form("nova_transacao"):
    descricao = st.text_input("Descrição")
    valor = st.number_input("Valor (positivo para receita, negativo para despesa)", step=0.01)
    categoria = st.text_input("Categoria")
    
    if st.form_submit_button("Salvar Transação"):
        payload = {"description": descricao, "amount": valor, "category": categoria}
        response = requests.post(f"{API_URL}/transactions/", json=payload, headers=headers)
        
        if response.status_code == 200:
            st.success("Transação salva com sucesso!")
            st.rerun()
        else:
            st.error(f"Erro ao salvar: {response.text}")

# Listar transações
st.subheader("Minhas Transações")
response = requests.get(f"{API_URL}/transactions/", headers=headers)

if response.status_code == 200:
    transacoes = response.json()

    # todo CODIGO ANTERIOR
    # if transacoes:
    #     # Cria um DataFrame para exibir como tabela
    #     df = pd.DataFrame(transacoes)
    #     df = df[["description", "amount", "category", "created_at"]]
    #     df.columns = ["Descrição", "Valor (R$)", "Categoria", "Data"]
    #     # st.dataframe(df, use_container_width=True)
    #     st.dataframe(df, width='stretch')
    # else:
    #     st.info("Nenhuma transação encontrada.")

    # * CODIGO ATUAL ATUAL ATUALIZADO!
    # ... (código anterior da tabela) ...
    if transacoes:
        # Cria um DataFrame para exibir como tabela
        df = pd.DataFrame(transacoes)
        df = df[["description", "amount", "category", "created_at"]]
        df.columns = ["Descrição", "Valor (R$)", "Categoria", "Data"]
        st.dataframe(df, width='stretch')
        
        # --- INÍCIO DO DASHBOARD ---
        st.markdown("---")
        st.subheader("📊 Resumo Financeiro")
        
        # Cálculos
        total_receitas = sum(t['amount'] for t in transacoes if t['amount'] > 0)
        total_despesas = sum(t['amount'] for t in transacoes if t['amount'] < 0)
        saldo = total_receitas + total_despesas

        # Exibindo as métricas em colunas
        col1, col2, col3 = st.columns(3)
        col1.metric("Total de Receitas", f"R$ {total_receitas:,.2f}")
        col2.metric("Total de Despesas", f"R$ {abs(total_despesas):,.2f}")
        col3.metric("Saldo Atual", f"R$ {saldo:,.2f}")

        # Gráfico de Despesas por Categoria
        st.subheader("Gastos por Categoria")
        despesas = [t for t in transacoes if t['amount'] < 0]
        
        if despesas:
            df_grafico = pd.DataFrame(despesas)
            df_grafico['amount'] = df_grafico['amount'].abs() # Converte para positivo
            
            fig = px.pie(df_grafico, values='amount', names='category', title='Distribuição de Gastos')
            st.plotly_chart(fig, width='stretch')
        else:
            st.info("Nenhuma despesa registrada para gerar o gráfico.")
        # --- FIM DO DASHBOARD ---

    else:
        st.info("Nenhuma transação encontrada.")
else:
    st.error("Erro ao carregar as transações. Faça login novamente.")