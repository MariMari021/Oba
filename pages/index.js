import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Image, TouchableOpacity, TextInput, Modal } from 'react-native';
import { CardAdicionado } from './cardAdicionado'; // Importe o componente CardAdicionado, se necessário
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


export function Home({ navigation, route }) {
    const [produtosAdicionados, setProdutosAdicionados] = useState([]);
    const [temCardAdicionado, setTemCardAdicionado] = useState(false);
    const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
    const [nextId, setNextId] = useState(1); // Contador para gerar ids únicos
    const [totalPreco, setTotalPreco] = useState(0); // Estado para armazenar o total do preço dos produtos
    const [preco, setPreco] = useState('');
    const [valorLimite, setValorLimite] = useState(''); // Inicializa sem nenhum valor
    // Estado para armazenar o valor limite digitado
    const [limiteUltrapassado, setLimiteUltrapassado] = useState(false); // Estado para controlar se o limite foi ultrapassado
    // Defina um estado para a quantidade do produto
    const [quantidade, setQuantidade] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Categoria1'); // Define "Categoria1" como categoria inicial selecionada
    const [scrollStates, setScrollStates] = useState({});
    const [nomeProduto, setNomeProduto] = useState('');
    const [modalAdicionarCardVisible, setModalAdicionarCardVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
   


    useEffect(() => {
        if (produtosAdicionados.length > 0) {
            setTemCardAdicionado(true);
        } else {
            setTemCardAdicionado(false);
        }
    }, [produtosAdicionados]);


    const handleCategoryPress = (category) => {
        setSelectedCategory(category);
    };

    const handleScroll = (event, category) => {
        const { contentOffset } = event.nativeEvent;
        setScrollStates(prevState => ({
            ...prevState,
            [category]: contentOffset
        }));
    };

    const onPressAdicionar = (id, novaQuantidade) => {
        // Atualize o estado de quantidade do produto com o novo valor
        setProdutosAdicionados(produtosAdicionados.map(produto => produto.id === id ? { ...produto, quantidade: novaQuantidade } : produto));
    };

    const handleNavigateToCompras = () => {
        // Navega para a página "Compras" e passa os produtos adicionados como parâmetro
        navigation.navigate('Compras', { produtosAdicionados: produtosAdicionados });

    };
    
    const renderCategoryScrollView = (category, imgSource) => {
        return (
            <ScrollView
                key={category}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => handleScroll(event, category)}
                scrollEventThrottle={16} // Ajuste conforme necessário
            >
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <Image
                            style={styles.imgCardAdicionar}
                            source={imgSource}
                        />
                        <Text style={styles.tituloAdicionar}>
                            Adicionar
                        </Text>
                        <Text style={styles.tituloAdicionarSpan}> o produto!</Text>
                        <TouchableOpacity style={styles.botaoMais} onPress={() => navigation.navigate('Produtos')}>
                            <Image
                                style={styles.maisProduto}
                                source={require('../assets/imgMaisProduto.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    {produtosAdicionados
                        .filter(produto => produto.categoria === selectedCategory)
                        .map((produto) => (
                            <CardAdicionado
                                key={produto.id}
                                id={produto.id}
                                nome={produto.nome}
                                quantidade={produto.quantidade}
                                preco={produto.preco}
                                onPressRemover={removerProduto}
                                onPressEditar={editarProduto}
                                onPressAdicionar={onPressAdicionar} // Adicione essa linha
                                navigation={navigation}
                            />
                        ))}
                </View>
            </ScrollView>
        );
    };

    const getCategoryScrollView = (category) => {
        switch (category) {
            case 'Categoria1':
                return renderCategoryScrollView(category, require('../assets/imgCard1.png'));
            case 'Categoria2':
                return renderCategoryScrollView(category, require('../assets/frutas.png'));
            case 'Categoria3':
                return renderCategoryScrollView(category, require('../assets/adega.png'));
            case 'Categoria4':
                return renderCategoryScrollView(category, require('../assets/padaria.png'));
            case 'Categoria5':
                return renderCategoryScrollView(category, require('../assets/acougue.png'));
            case 'Categoria6':
                return renderCategoryScrollView(category, require('../assets/mercearia.png'));
            case 'Categoria7':
                return renderCategoryScrollView(category, require('../assets/frios.png'));
            case 'Categoria8':
                return renderCategoryScrollView(category, require('../assets/outros.png'));
            // Adicione mais casos conforme necessário para outras categorias
            default:
                return null;
        }
    };


    const toggleCategoriaSelecionada = (categoria) => {
        setCategoriasSelecionadas(prevState =>
            prevState.includes(categoria)
                ? prevState.filter(item => item !== categoria)
                : [...prevState, categoria]
        );
    };

    const limparCategoriasSelecionadas = () => {
        if (produtosAdicionados.length > 0) {
            const novosProdutos = produtosAdicionados.filter(produto => !categoriasSelecionadas.includes(produto.categoria));

            let total = 0;
            novosProdutos.forEach(produto => {
                total += produto.preco * produto.quantidade;
            });

            setProdutosAdicionados(novosProdutos);
            setTotalPreco(total);
            setCategoriasSelecionadas([]);
            if (total > 0) {
                setModalVisible(true);
            }
        } else {
            if (totalPreco === 0) {
                setModalAdicionarCardVisible(true);
            } else {
                setModalVisible(true);
            }
        }
    };


    useEffect(() => {
        console.log("Modal visibility changed:", modalVisible);
    }, [modalVisible]);



    const adicionarProduto = (produto) => {
        const produtoComCategoria = { ...produto, categoria: selectedCategory };
        const index = produtosAdicionados.findIndex(p => p.id === produto.id);
        if (index !== -1) {
            const novosProdutosAdicionados = [...produtosAdicionados];
            novosProdutosAdicionados[index] = produtoComCategoria;
            setProdutosAdicionados(novosProdutosAdicionados);
        } else {
            produtoComCategoria.id = nextId;
            setProdutosAdicionados([produtoComCategoria, ...produtosAdicionados]);
            setNextId(nextId + 1);
        }
    };
    
    
    

    const removerProduto = (idParaRemover) => {
        // Encontra o índice do produto a ser removido
        const indexToRemove = produtosAdicionados.findIndex(produto => produto.id === idParaRemover);

        // Se o índice for encontrado, remove o produto da lista utilizando splice
        if (indexToRemove !== -1) {
            const newProdutosAdicionados = [...produtosAdicionados];
            newProdutosAdicionados.splice(indexToRemove, 1); // Remove 1 elemento a partir do índice indexToRemove
            setProdutosAdicionados(newProdutosAdicionados);
        }
    };

    const editarProduto = (produto) => {
        setNomeProduto(produto.nome);
        setQuantidade(produto.quantidade);
        setPreco(produto.preco);
    };

    useEffect(() => {
        if (route.params && route.params.novoProduto) {
            const novoProduto = route.params.novoProduto;
            adicionarProduto(novoProduto);
        }
    }, [route.params]);

    useEffect(() => {
        let total = 0;
        produtosAdicionados.forEach(produto => {
            total += produto.preco * produto.quantidade;
        });
        setTotalPreco(total);
    }, [produtosAdicionados]);

    useEffect(() => {
        const limite = parseFloat(valorLimite);
        setLimiteUltrapassado(totalPreco > limite);
    }, [totalPreco, valorLimite]);

    const [fontsLoaded, fontError] = useFonts({ 'Inter': require('../assets/fonts/Inter-VariableFont_slnt,wght.ttf') });

    useEffect(() => {
        async function loadData() {
            SplashScreen.preventAutoHideAsync();
        }
        loadData();
    }, []);

    useEffect(() => {
        if (route.params?.produto) {
            adicionarProduto(route.params.produto);
        }
    }, [route.params]);

    useEffect(() => {
        async function hideSplash() {
            if (fontsLoaded || fontError) {
                await SplashScreen.hideAsync();
            }
        }
        hideSplash();
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    const handleVoltar = () => {
        navigation.navigate('Compras'); 
    };

    return (
        <ScrollView style={{ height: 50 }}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerInicio}>
                        <Image
                            style={styles.profile}
                            source={require('../assets/profile.png')}
                        />
                         <TouchableOpacity onPress={handleVoltar}>
                        <Image 
                            style={styles.sacola}
                            source={require('../assets/sacola.png')}
                        />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.containerLogo}>
                        <Text style={styles.bemVindo}>Seja bem-vindo ao</Text>
                        <Image
                            style={styles.logo}
                            source={require('../assets/logo.png')}
                        />
                    </View>
                </View>

                <View style={styles.precoMax}>
                    <Image
                        style={styles.dinheiro}
                        source={require('../assets/imgValor.png')}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Digite o valor máx. da compra."
                        placeholderTextColor="#000"
                        keyboardType="numeric"
                        onChangeText={setValorLimite}
                        value={valorLimite.toString()}
                    />

                </View>
                <View style={styles.mercados}>
                    <Text style={styles.mercadosTitulo}>
                        Categorias
                    </Text>
                    <View style={styles.opcoesMercado}>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <TouchableOpacity style={[
                                styles.adicionarMercado,
                                selectedCategory === 'Categoria1' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria1')}>
                                <Text style={[
                                    styles.adicionarMercadoTexto,
                                    selectedCategory === 'Categoria1' && { color: 'white' },
                                ]}>
                                    Variados
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.adicionarHortifruti,
                                    selectedCategory === 'Categoria2' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                                ]}
                                onPress={() => handleCategoryPress('Categoria2')}>
                                <Text style={[
                                    styles.adicionarHortifrutiTexto,
                                    selectedCategory === 'Categoria2' && { color: 'white' },
                                ]}>Hortifruti</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[
                                styles.adicionarAdega,
                                selectedCategory === 'Categoria3' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria3')} >
                                <Text style={[
                                    styles.adicionarAdegaTexto,
                                    selectedCategory === 'Categoria3' && { color: 'white' },
                                ]}>
                                    Adega
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[
                                styles.adicionarPadaria,
                                selectedCategory === 'Categoria4' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria4')} >
                                <Text style={[
                                    styles.adicionarPadariaTexto,
                                    selectedCategory === 'Categoria4' && { color: 'white' },
                                ]}>
                                    Padaria
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[
                                styles.adicionarAcougue,
                                selectedCategory === 'Categoria5' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria5')}>
                                <Text style={[
                                    styles.adicionarAcougueTexto,
                                    selectedCategory === 'Categoria5' && { color: 'white' },
                                ]}>
                                    Açougue
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[
                                styles.adicionarMercearia,
                                selectedCategory === 'Categoria6' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria6')}>
                                <Text style={[
                                    styles.adicionarMerceariaTexto,
                                    selectedCategory === 'Categoria6' && { color: 'white' },
                                ]}>
                                    Mercearia
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[
                                styles.adicionarFrios,
                                selectedCategory === 'Categoria7' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria7')} >
                                <Text style={[
                                    styles.adicionarFriosTexto,
                                    selectedCategory === 'Categoria7' && { color: 'white' },
                                ]}>
                                    Frios
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[
                                styles.adicionarOutros,
                                selectedCategory === 'Categoria8' && { backgroundColor: "#7DBF4E", borderColor: "white" },
                            ]} onPress={() => handleCategoryPress('Categoria8')}>
                                <Text style={[
                                    styles.adicionarOutrosTexto,
                                    selectedCategory === 'Categoria8' && { color: 'white' },
                                ]}>
                                    Outros
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
                {selectedCategory && getCategoryScrollView(selectedCategory)}
                <View style={styles.limparContainer}>
                    <TouchableOpacity
                        style={styles.apagarTudo}
                        onPress={limparCategoriasSelecionadas}
                    >
                        <Image
                            style={styles.lixo}
                            source={require('../assets/lixo.png')}
                        />
                        <Text style={styles.apagarTudoTexto}>
                            Limpar
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.salvarTudo}>
                        <Image style={styles.lixo} source={require('../assets/adicionar.png')} />
                        <Text style={styles.apagarTudoTexto}>Salvar lista</Text>
                    </TouchableOpacity>


                </View>


                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Selecione as categorias a serem limpas:</Text>
                            {['Categoria1', 'Categoria2', 'Categoria3', 'Categoria4', 'Categoria5', 'Categoria6', 'Categoria7', 'Categoria8'].map((categoria) => (
                                <TouchableOpacity
                                    key={categoria}
                                    style={[
                                        styles.categoriaButton,
                                        categoriasSelecionadas.includes(categoria) && { backgroundColor: '#7DBF4E' }
                                    ]}
                                    onPress={() => toggleCategoriaSelecionada(categoria)}
                                >
                                    <Text style={styles.categoriaButtonText}>{categoria}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    limparCategoriasSelecionadas();
                                    setModalVisible(false);
                                }}
                            >

                                <Text style={styles.modalButtonText}>Limpar Categorias</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalAdicionarCardVisible}
                    onRequestClose={() => setModalAdicionarCardVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Adicione um card antes de limpar!</Text>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setModalAdicionarCardVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <View style={styles.containerValorTotal}>
                    <View style={styles.valorTotal}>
                        <View style={styles.resultado}>
                            <Image
                                style={styles.dinheiro}
                                source={require('../assets/dinheiro.png')}
                            />
                            <Text style={styles.valorTotalTexto}>R$</Text>
                        </View>
                        <Text style={[styles.valorTotalPreco, { color: limiteUltrapassado ? 'orange' : 'white' }]}>
                            {totalPreco.toFixed(2)}
                        </Text>
                    </View>
                </View>
                <View style={styles.mensagemFinal}>
                    {limiteUltrapassado && (
                        <Text style={styles.avisoLimite}>O valor total dos produtos excede o limite especificado.</Text>
                    )}
                    {valorLimite && totalPreco > valorLimite && (
                        <Text style={styles.diferençaTotal}>
                            Diferença: R$ {limiteUltrapassado ? (totalPreco - valorLimite).toFixed(2) : (valorLimite - totalPreco).toFixed(2)}
                        </Text>
                    )}
                </View>
                <Text onPress={() => navigation.navigate('ListaSalva')}>Ir para listas</Text>
            </View>
        </ScrollView>
    );
}



const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F9F9F9',

    },
    header: {
        backgroundColor: "#fff",
        borderBottomEndRadius: 35,
        borderBottomStartRadius: 35,
        padding: 40,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.16)'
    },
    headerInicio: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    profile: {
        width: 50,
        height: 50
    },
    sacola: {
        width: 30,
        height: 30
    },
    bemVindo: {
        paddingTop: 20,
        color: 'rgba(0, 0, 0, 0.62)',
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 26
    },
    logo: {
        width: 155,
        height: 35
    },
    dinheiro: {
        width: 43,
        height: 43,
        marginRight: 15
    },
    input: {
        width: 248,
        height: 43,
        paddingLeft: 20,
        padding: 10, // Reduzido o padding para 10
        borderWidth: 0.70,
        borderColor: "#B8C8B7",
        borderRadius: 25,
        color: "#000",
        fontFamily: "Inter",
        alignItems: 'flex-start',
        backgroundColor: "#FFF"
    },
    precoMax: {
        flexDirection: "row",
        paddingEnd: 40,
        paddingStart: 40,
        padding: 30,
        alignItems: "center"

    },
    mercados: {
        paddingTop: 15,
        paddingEnd: 40,
        paddingStart: 40,
    },
    mercadosTitulo: {
        fontFamily: "Inter",
        fontSize: 25,
        fontWeight: "900",
        color: "#0B8C38",
        paddingBottom: 15
    },
    opcoesMercado: {
        flexDirection: "row",
        justifyContent: "space-around"
    },
    adicionarMercado: {
        marginRight: 13,
        width: 130,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarMercadoTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarHortifruti: {
        marginRight: 15,
        width: 134,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarHortifrutiTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarAdega: {
        marginRight: 13,
        width: 113,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarAdegaTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarPadaria: {
        marginRight: 13,
        width: 120,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarPadariaTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarAcougue: {
        marginRight: 13,
        width: 120,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarAcougueTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarMercearia: {
        marginRight: 13,
        width: 130,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarMerceariaTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarFrios: {
        marginRight: 13,
        width: 92,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarFriosTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarOutros: {
        marginRight: 13,
        width: 106,
        height: 33,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.44)'
    },
    adicionarOutrosTexto: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 17.3,
        color: 'rgba(0, 0, 0, 0.62)'
    },
    adicionarIcon: {
        width: 32,
        height: 32,
    },
    cardContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 40,
        alignItems: "center"
    },
    imgCardAdicionar: {
        width: 135,
        height: 135,
        alignSelf: "flex-end",
        marginTop: 15
    },
    imgCardAdicionado: {
        width: 115,
        height: 115,
        alignSelf: "flex-end",
        marginTop: 15
    },
    card: {
        marginRight: 53,
        paddingTop: 10,
        backgroundColor: "#0B8C38",
        height: 325,
        width: 230,
        borderRadius: 22,
        shadowColor: '#000', // Cor da sombra
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.6, // Opacidade da sombra (entre 0 e 1)
        shadowRadius: 10, // Raio da sombra
        elevation: 10,
    },
    cardAdicionado: {
        marginRight: 53,
        paddingTop: 10,
        backgroundColor: "#0B8C38",
        height: 325,
        width: 230,
        borderRadius: 22,
        shadowColor: '#000', // Cor da sombra
        shadowOffset: {
            width: 4,
            height: 4,
        },
        shadowOpacity: 0.6, // Opacidade da sombra (entre 0 e 1)
        shadowRadius: 10, // Raio da sombra
        elevation: 10,
    },
    botaoMais: {
        marginEnd: '8%'
    },
    maisProduto: {
        width: 60,
        height: 60,
        alignSelf: "flex-end",

    },
    tituloAdicionar: {
        fontFamily: "Inter",
        fontWeight: "800",
        fontSize: 27,
        color: "#F7AB38",
        width: 129.8,
        marginStart: "12%"
    },
    tituloAdicionarSpan: {
        fontFamily: "Inter",
        marginStart: "9%",
        fontWeight: "800",
        fontSize: 27,
        color: "#FFf"
    },
    valores: {
        paddingTop: 7,
        flexDirection: "row",
        marginStart: "12%",
        alignItems: "center",
    },
    quantidade: {
        paddingStart: 15,
        paddingEnd: 15,
        fontFamily: "Inter",
        fontWeight: "800",
        color: "white",
        fontSize: 19
    },
    botaoMaisProduto: {
        width: 36,
        height: 22
    },
    botaoMenosProduto: {
        width: 37,
        height: 22
    },
    valorProduto: {
        paddingStart: "12%",
        paddingTop: 10,
        fontFamily: "Inter",
        fontWeight: '900',
        fontSize: 23,
        color: "white"
    },
    limparContainer: {
        paddingStart: "6%",
        paddingEnd: "6%",
        flexDirection: 'row',
        justifyContent: "space-evenly"

    },
    salvarTudo: {
        backgroundColor: '#fff',
        flexDirection: "row",
        borderWidth: 1.3,
        borderColor: 'rgba(00, 00, 00, 0.44)',
        padding: 7,
        width: 143,
        justifyContent: "space-around",
        borderRadius: 25,
        alignItems: "center"
    },
    apagarTudo: {
        backgroundColor: '#fff',
        flexDirection: "row",
        borderWidth: 1.3,
        borderColor: 'rgba(00, 00, 00, 0.44)',
        padding: 7,
        width: 130,
        justifyContent: "space-around",
        borderRadius: 25,
        alignItems: "center"
    },
    apagarTudoTexto: {
        fontFamily: "Inter",
        fontSize: 17.3,
        fontWeight: "800",
        color: 'rgba(22, 85, 21, 0.85)'
    },
    lixo: {
        width: 22,
        height: 22
    },
    containerValorTotal: {
        paddingStart: 40,
        paddingEnd: 40,
    },
    valorTotal: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingEnd: "8%",
        paddingStart: "8%",
        height: 60,
        backgroundColor: "#0B8C38",
        borderRadius: 15,
        marginTop: 25,
        marginBottom: 50
    },
    resultado: {
        flexDirection: "row",
        alignItems: "center"
    },
    valorTotalTexto: {
        fontFamily: "Inter",
        fontSize: 25,
        fontWeight: "800",
        color: "white",
    },
    valorTotalPreco: {
        fontFamily: "Inter",
        fontSize: 25,
        fontWeight: "800",
        color: "white",
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#7DBF4E',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#B0B0B0',
    },
    categoriaButton: {
        backgroundColor: '#E0E0E0',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    categoriaButtonText: {
        fontSize: 16,
    },
    modalInput: {
        backgroundColor: "#000",
        color: "#Fff",
        width: 230
    }
});
