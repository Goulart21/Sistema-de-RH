from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import face_recognition
import sqlite3
import pickle
import io
from datetime import datetime
import base64
from PIL import Image
import numpy as np

app = Flask(__name__)
CORS(app)

conn = sqlite3.connect("banco.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    departamento TEXT NOT NULL,
    data_contratacao TEXT NOT NULL,
    encoding BLOB NOT NULL,
    senha TEXT NOT NULL
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_funcionario INTEGER,
    data_avaliacao TEXT NOT NULL,
    produtividade INTEGER,
    qualidade INTEGER,
    trabalho_equipe INTEGER,
    comunicacao INTEGER,
    pontualidade INTEGER,
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id)
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS pontos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_funcionario INTEGER NOT NULL,
    data_ponto TEXT NOT NULL,
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id)
)
''')

conn.commit()
conn.close()


@app.route("/")
def index():
    return render_template("index.html")

import os

if not os.path.exists("admin.jpg"):
    print(" Imagem admin.jpg não encontrada. Pulei o cadastro automático do admin.")
else:
    imagem = face_recognition.load_image_file("admin.jpg")
    encodings = face_recognition.face_encodings(imagem)

    if encodings:
        encoding_serializado = pickle.dumps(encodings[0])
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

       
        cursor.execute("SELECT * FROM funcionarios WHERE nome = 'admin'")
        if cursor.fetchone() is None:
            cursor.execute('''
                INSERT INTO funcionarios (nome, cargo, departamento, data_contratacao, encoding, senha)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', ("admin", "Administrador", "RH", datetime.now().strftime("%Y-%m-%d"), encoding_serializado, "admin"))
            conn.commit()
            print(" Admin cadastrado com sucesso!")
        else:
            print(" Admin já está cadastrado.")
        conn.close()
    else:
        print(" Nenhum rosto encontrado na imagem admin.jpg. Cadastro do admin ignorado.")


def salvar_funcionario(nome, cargo, departamento, data_contratacao, encoding, senha):
    encoding_serializado = pickle.dumps(encoding)
    conn = sqlite3.connect("banco.db")
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO funcionarios (nome, cargo, departamento, data_contratacao, encoding, senha)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (nome, cargo, departamento, data_contratacao, encoding_serializado, senha))
    conn.commit()
    conn.close()

@app.route('/cadastrar', methods=['POST'])
def cadastrar_rosto():
    campos = ['nome', 'cargo', 'departamento', 'data_contratacao', 'senha']
    if not all(campo in request.form for campo in campos) or 'imagem' not in request.files:
        return jsonify({'erro': 'Envie nome, cargo, departamento, data de contratação, senha e imagem.'}), 400

    nome = request.form['nome'].strip()
    cargo = request.form['cargo'].strip()
    departamento = request.form['departamento'].strip()
    data_contratacao = request.form['data_contratacao'].strip()
    senha = request.form['senha'].strip()
    imagem_file = request.files['imagem']
    imagem_bytes = imagem_file.read()

    try:
        imagem = face_recognition.load_image_file(io.BytesIO(imagem_bytes))
        codificacoes = face_recognition.face_encodings(imagem)

        if not codificacoes:
            return jsonify({'erro': 'Nenhum rosto detectado na imagem.'}), 400

        salvar_funcionario(nome, cargo, departamento, data_contratacao, codificacoes[0], senha)

        return jsonify({'mensagem': f'Funcionário {nome} cadastrado com sucesso.'})

    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    

@app.route("/login-reconhecimento", methods=["POST"])
def login_reconhecimento():
    try:
        imagem_base64 = request.form['imagem']
        if not imagem_base64:
            return jsonify({"status": "erro", "mensagem": "Imagem não recebida."}), 400

        if "," in imagem_base64:
            imagem_base64 = imagem_base64.split(",")[1]

        imagem_bytes = base64.b64decode(imagem_base64)
        imagem_pil = Image.open(io.BytesIO(imagem_bytes)).convert("RGB")
        imagem_np = np.array(imagem_pil)

        rosto_desconhecido_encodings = face_recognition.face_encodings(imagem_np)
        if not rosto_desconhecido_encodings:
            return jsonify({"status": "erro", "mensagem": "Nenhum rosto detectado na imagem."}), 400

        rosto_desconhecido_encoding = rosto_desconhecido_encodings[0]

        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

        cursor.execute("SELECT id, nome, encoding FROM funcionarios")
        funcionarios = cursor.fetchall()
        conn.close()

        for id_func, nome, encoding_blob in funcionarios:
            encoding_conhecido = pickle.loads(encoding_blob)
            resultados = face_recognition.compare_faces([encoding_conhecido], rosto_desconhecido_encoding, tolerance=0.5)

            if resultados[0]:
                tipo = "admin" if nome == "admin" else "funcionario"
                return jsonify({
                    "status": "ok",
                    "mensagem": f"Bem-vindo(a), {nome}!",
                    "id": id_func,
                    "tipo": tipo
                })

        return jsonify({"status": "erro", "mensagem": "Rosto não reconhecido."}), 401

    except Exception as e:
        print("Erro no login por reconhecimento:", e)
        return jsonify({"status": "erro", "mensagem": "Erro interno no servidor."}), 500



@app.route('/atualizar/<int:id>', methods=['PUT'])
def atualizar_funcionario(id):
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM funcionarios WHERE id = ?", (id,))
        funcionario = cursor.fetchone()

        if not funcionario:
            conn.close()
            return jsonify({'erro': 'Funcionário não encontrado.'}), 404

        nome = request.form.get('nome')
        cargo = request.form.get('cargo')
        departamento = request.form.get('departamento')
        data_contratacao = request.form.get('data_contratacao')
        senha = request.form.get('senha')
        imagem_file = request.files.get('imagem')

        atualizacoes = []
        valores = []

        if nome:
            atualizacoes.append("nome = ?")
            valores.append(nome.strip())
        if cargo:
            atualizacoes.append("cargo = ?")
            valores.append(cargo.strip())
        if departamento:
            atualizacoes.append("departamento = ?")
            valores.append(departamento.strip())
        if data_contratacao:
            atualizacoes.append("data_contratacao = ?")
            valores.append(data_contratacao.strip())
        if senha:
            atualizacoes.append("senha = ?")
            valores.append(senha.strip())

        if imagem_file:
            imagem_bytes = imagem_file.read()
            imagem = face_recognition.load_image_file(io.BytesIO(imagem_bytes))
            codificacoes = face_recognition.face_encodings(imagem)
            if not codificacoes:
                conn.close()
                return jsonify({'erro': 'Nenhum rosto detectado na nova imagem.'}), 400
            encoding_serializado = pickle.dumps(codificacoes[0])
            atualizacoes.append("encoding = ?")
            valores.append(encoding_serializado)

        if not atualizacoes:
            conn.close()
            return jsonify({'erro': 'Nenhuma informação fornecida para atualização.'}), 400

        valores.append(id)
        query = f"UPDATE funcionarios SET {', '.join(atualizacoes)} WHERE id = ?"
        cursor.execute(query, valores)
        conn.commit()
        conn.close()

        return jsonify({'mensagem': f'Funcionário ID {id} atualizado com sucesso.'})

    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'erro': str(e)}), 500



@app.route('/deletar/<int:id>', methods=['DELETE'])
def deletar_cadastro(id):
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()
        cursor.execute("SELECT nome FROM funcionarios WHERE id = ?", (id,))
        resultado = cursor.fetchone()

        if resultado is None:
            conn.close()
            return jsonify({'erro': 'Cadastro não encontrado.'}), 404

        nome = resultado[0]
        cursor.execute("DELETE FROM funcionarios WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return jsonify({'mensagem': f'Cadastro de {nome} (ID: {id}) removido com sucesso.'})

    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'erro': str(e)}), 500

@app.route('/listar', methods=['GET'])
def listar_cadastros():
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, nome, cargo, departamento, data_contratacao FROM funcionarios")
        resultados = cursor.fetchall()
        conn.close()

        cadastros = [{
            'id': id,
            'nome': nome,
            'cargo': cargo,
            'departamento': departamento,
            'data_contratacao': data_contratacao
        } for id, nome, cargo, departamento, data_contratacao in resultados]

        return jsonify({'cadastros': cadastros})

    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'erro': str(e)}), 500


@app.route('/registrar_ponto', methods=['POST'])
def registrar_ponto():
    if 'imagem' not in request.files:
        return jsonify({'erro': 'Envie uma imagem para o reconhecimento facial.'}), 400

    imagem_file = request.files['imagem']
    imagem_bytes = imagem_file.read()

    try:
        imagem = face_recognition.load_image_file(io.BytesIO(imagem_bytes))
        codificacoes = face_recognition.face_encodings(imagem)

        if not codificacoes:
            return jsonify({'erro': 'Nenhum rosto detectado na imagem.'}), 400

        encoding_foto = codificacoes[0]

        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, encoding FROM funcionarios")
        funcionarios = cursor.fetchall()

        for funcionario in funcionarios:
            id_funcionario = funcionario[0]
            encoding_banco = pickle.loads(funcionario[1])

            resultado = face_recognition.compare_faces([encoding_banco], encoding_foto)

            if resultado[0]:
                data_ponto = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                cursor.execute("INSERT INTO pontos (id_funcionario, data_ponto) VALUES (?, ?)",
                               (id_funcionario, data_ponto))
                conn.commit()
                conn.close()
                return jsonify({'mensagem': f'Ponto registrado para o funcionário {id_funcionario}.'})

        conn.close()
        return jsonify({'erro': 'Rosto não reconhecido.'}), 404

    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    

@app.route('/listar-ponto', methods=['GET'])
def listar_ponto():
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, id_funcionario, data_ponto FROM pontos")
        resultados = cursor.fetchall()
        conn.close()

        pontos = [{
            'id': id,
            'id_funcionario': id_funcionario,
            'data_ponto': data_ponto,
            
        } for id, id_funcionario, data_ponto in resultados]

        return jsonify({'pontos': pontos})

    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'erro': str(e)}), 500
    

@app.route('/avaliar/<int:id_funcionario>', methods=['POST'])
def adicionar_avaliacao(id_funcionario):
    dados = request.get_json()
    campos = ['produtividade', 'qualidade', 'trabalho_equipe', 'comunicacao', 'pontualidade']

    if not dados:
        return jsonify({'erro': 'Envie os dados da avaliação no formato JSON.'}), 400

    if not all(campo in dados for campo in campos):
        return jsonify({'erro': f'Campos obrigatórios: {campos}'}), 400

    try:
        produtividade = int(dados['produtividade'])
        qualidade = int(dados['qualidade'])
        trabalho_equipe = int(dados['trabalho_equipe'])
        comunicacao = int(dados['comunicacao'])
        pontualidade = int(dados['pontualidade'])
    except:
        return jsonify({'erro': 'Os campos da avaliação devem ser inteiros.'}), 400

    data_avaliacao = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

  
        cursor.execute("SELECT id FROM funcionarios WHERE id = ?", (id_funcionario,))
        if cursor.fetchone() is None:
            conn.close()
            return jsonify({'erro': 'Funcionário não encontrado.'}), 404

        cursor.execute('''
            INSERT INTO avaliacoes (id_funcionario, data_avaliacao, produtividade, qualidade, trabalho_equipe, comunicacao, pontualidade)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (id_funcionario, data_avaliacao, produtividade, qualidade, trabalho_equipe, comunicacao, pontualidade))

        conn.commit()
        conn.close()

        return jsonify({'mensagem': f'Avaliação adicionada para o funcionário ID {id_funcionario}.'})

    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'erro': str(e)}), 500


@app.route('/desempenho/<int:id_funcionario>', methods=['GET'])
def desempenho_individual(id_funcionario):
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT produtividade, qualidade, trabalho_equipe, comunicacao, pontualidade
            FROM avaliacoes
            WHERE id_funcionario = ?
            ORDER BY data_avaliacao DESC
            LIMIT 1
        """, (id_funcionario,))
        avaliacao = cursor.fetchone()

        conn.close()

        if not avaliacao:
            return jsonify({'erro': 'Nenhuma avaliação encontrada para este funcionário.'}), 404

        prod, qual, equipe, com, pont = avaliacao

        dados = {
            'produtividade': prod,
            'qualidade': qual,
            'trabalho_equipe': equipe,
            'comunicacao': com,
            'pontualidade': pont
        }

        return jsonify(dados)

    except Exception as e:
        return jsonify({'erro': str(e)}), 500



@app.route('/comparativo_desempenho', methods=['GET'])
def comparativo_desempenho():
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT f.id, f.nome,
                   AVG(a.produtividade),
                   AVG(a.qualidade),
                   AVG(a.trabalho_equipe),
                   AVG(a.comunicacao),
                   AVG(a.pontualidade)
            FROM funcionarios f
            JOIN avaliacoes a ON f.id = a.id_funcionario
            GROUP BY f.id
        """)
        resultados = cursor.fetchall()
        conn.close()

        if not resultados:
            return jsonify({'erro': 'Nenhuma avaliação disponível.'}), 404

        dados = []
        for id_func, nome, prod, qual, equipe, com, pont in resultados:
            dados.append({
                'id': id_func,
                'nome': nome,
                'produtividade': round(prod, 2),
                'qualidade': round(qual, 2),
                'trabalho_equipe': round(equipe, 2),
                'comunicacao': round(com, 2),
                'pontualidade': round(pont, 2)
            })

        return jsonify(dados)

    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    
    

@app.route('/classificacao_desempenho/<int:id_funcionario>', methods=['GET'])
def classificacao_desempenho(id_funcionario):
    try:
        conn = sqlite3.connect("banco.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT AVG(produtividade), AVG(qualidade), AVG(trabalho_equipe), AVG(comunicacao), AVG(pontualidade)
            FROM avaliacoes
            WHERE id_funcionario = ?
        """, (id_funcionario,))
        medias = cursor.fetchone()
        conn.close()

        if not medias or all(m is None for m in medias):
            return jsonify({'erro': 'Nenhuma avaliação encontrada para este funcionário.'}), 404

        media_geral = sum(medias) / len(medias)
        media_geral = round(media_geral)

        if media_geral == 5:
            nivel = "Excelente"
        elif media_geral == 4:
            nivel = "Muito Bom"
        elif media_geral == 3:
            nivel = "Mediano"
        elif media_geral == 2:
            nivel = "A Melhorar"
        else:
            nivel = "Insatisfatório"

        return jsonify({
            'media_geral': round(sum(medias) / len(medias), 2),
            'classificacao': nivel
        })

    except Exception as e:
        return jsonify({'erro': str(e)}), 500


if __name__ == '__main__':
    app.run()
