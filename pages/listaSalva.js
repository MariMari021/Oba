import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function ListaSalva({ route }) {
    const navigation = useNavigation();
    const [listasSalvas, setListasSalvas] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedLista, setSelectedLista] = useState(null);
    const [modalExcluirVisible, setModalExcluirVisible] = useState(false);

    useEffect(() => {
        if (route.params?.listasSalvas) {
            setListasSalvas(route.params.listasSalvas);
            salvarListas(route.params.listasSalvas); // Salva as listas ao receber novas do parâmetro
        }
    }, [route.params?.listasSalvas]);

    useEffect(() => {
        carregarListasSalvas(); // Carrega as listas salvas ao iniciar o componente
    }, []);

    const salvarListas = async (listas) => {
        try {
            const jsonValue = JSON.stringify(listas);
            await AsyncStorage.setItem('listasSalvas', jsonValue);
        } catch (error) {
            console.error('Erro ao salvar as listas: ', error);
        }
    };

    const carregarListasSalvas = async () => {
        try {
            const listasSalvasString = await AsyncStorage.getItem('listasSalvas');
            if (listasSalvasString !== null) {
                setListasSalvas(JSON.parse(listasSalvasString));
            }
        } catch (error) {
            console.error('Erro ao carregar as listas salvas: ', error);
        }
    };

    const handleListaPress = (lista) => {
        setSelectedLista(lista);
        setModalVisible(true);
    };

    const excluirLista = async () => {
        const novasListas = listasSalvas.filter(lista => lista !== selectedLista);
        setListasSalvas(novasListas);
        setModalVisible(false);
        setModalExcluirVisible(false);
        await salvarListas(novasListas); // Salva as listas após excluir
        if (route.params?.atualizarListas) {
            route.params.atualizarListas(novasListas);
        }
        navigation.navigate('ListaSalva', { listasSalvas: novasListas });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.topBar}>
                <View style={styles.iconContainer}>
                    <Image source={require('../assets/profile.png')} style={styles.iconeTopo} />
                    <Image source={require('../assets/sacola.png')} style={styles.iconeTopo2} />
                </View>
                <View style={styles.header}>
                    <Text style={styles.greeting}>
                        Listas
                        <Text style={styles.greenText}> Salvas </Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Consulte as listas que você salvou anteriormente.
                    </Text>
                </View>
            </View>

            {listasSalvas.length === 0 ? ( // Verifica se não há listas salvas
                <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>Salve as listas</Text>
                    <Text style={styles.emptyListText}>para aparecer <Text style={styles.yellowText}>aqui!</Text></Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Image
                            style={styles.mais}
                            source={require('../assets/maisIcone.png')}
                        />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.content}>
                    {listasSalvas.map((lista, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleListaPress(lista)}
                            style={styles.listaContainer}
                        >
                            <View style={styles.textContainer}>
                                <Text style={styles.nomeLista}>{lista.nome}</Text>
                                <Text style={styles.categoriaLista}>{lista.categoria}</Text>
                                <Text style={styles.dataLista}>{new Date(lista.data).toLocaleDateString()}</Text>
                            </View>
                            <Image source={require('../assets/playIcone.png')} style={styles.playIcon} />
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedLista?.nome}</Text>
                        <Text style={styles.modalDate}>{new Date(selectedLista?.data).toLocaleDateString()}</Text>
                        <ScrollView
                            style={styles.categoriaScrollViewSalvar}
                            showsVerticalScrollIndicator={true}
                            persistentScrollbar={true}
                        >
                            {selectedLista?.produtos.map((produto, index) => (
                                <View key={index} style={styles.produtoContainer}>
                                    <View style={styles.produtoHeader}>
                                        <View style={styles.produtoIndex}>
                                            <Text style={styles.produtoIndexText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.produtoNome}>{produto.nome}</Text>
                                    </View>
                                    <Text style={styles.produtoQuantidade}>Quantidade: {produto.quantidade}</Text>
                                    <Text style={styles.produtoPreco}>Preço unitário: R$ {produto.preco.toFixed(2)}</Text>
                                    <Text style={styles.produtoTotal}>Preço Total: R$ {(produto.quantidade * produto.preco).toFixed(2)}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.modalButton, styles.closeButton]}
                            >
                                <Text style={styles.modalButtonText}>Fechar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setModalExcluirVisible(true)}
                                style={[styles.modalButton, styles.deleteButton]}
                            >
                                <Text style={styles.modalButtonText2}>Excluir</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalExcluirVisible}
                onRequestClose={() => setModalExcluirVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle2}>Tem certeza que deseja excluir esta lista?</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                onPress={excluirLista}
                                style={[styles.modalButton, styles.deleteButton]}
                            >
                                <Text style={styles.modalButtonText2}>Excluir</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setModalExcluirVisible(false)}
                                style={[styles.modalButton, styles.closeButton]}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: '#F9F9F9',
    },
    topBar: {
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 10,
        marginBottom: 40,
        borderBottomEndRadius: 35,
        borderBottomStartRadius: 35,
        backgroundColor: '#fff',
    },
    mais: {
        width: 40,
        height: 40,
        marginTop: 20
    },
    iconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    iconeTopo: {
        width: 42,
        height: 42,
        marginTop: 20
    },
    iconeTopo2: {
        width: 30,
        height: 30,
        marginTop: 20
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5F5F5F',
        marginLeft: 20
    },
    header: {
        paddingTop: 15,
        paddingHorizontal: 20,
    },
    greenText: {
        color: '#0B8C38',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 20
    },
    content: {
        paddingEnd: 33,
        paddingStart: 33,
    },
    listaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#88B887',
        padding: 25,
        borderRadius: 19,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#ccc',
        height: 110
    },
    textContainer: {
        flex: 1,
    },
    nomeLista: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    categoriaLista: {
        fontSize: 19,
        color: '#fff',
        fontWeight: 'bold'
    },
    dataLista: {
        fontSize: 15,
        color: '#5F5F5F',
        fontWeight: 'bold'
    },
    playIcon: {
        width: 42,
        height: 42,
        marginLeft: 10,
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0B8C38',
        marginBottom: 5,
    },
    modalTitle2: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0B8C38',
        marginBottom: 40,
    },
    modalDate: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    produtoContainer: {
        width: '100%',
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    produtoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    produtoIndex: {
        backgroundColor: '#FF7F11',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    produtoIndexText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    produtoNome: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0B8C38'
    },
    produtoQuantidade: {
        fontSize: 16,
        color: '#666',
    },
    produtoPreco: {
        fontSize: 16,
        color: '#666',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        padding: 10,
        borderRadius: 25,
        width: '48%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#fff',
        borderColor: '#FF7F11',
        borderWidth: 2,
    },
    deleteButton: {
        backgroundColor: '#FF7F11',
    },
    modalButtonText: {
        color: '#FF7F11',
        fontWeight: 'bold',
    },
    modalButtonText2: {
        color: '#ffff',
        fontWeight: 'bold',
    },
    closeModalButtonText: {
        color: '#FF7F11',
    },
    deleteIcon: {
        width: 24,
        height: 24,
    },
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyListText: {
        fontWeight: 'bold',
        fontSize: 22,
        color: '#5F5F5F'
    },
    yellowText: {
        color: '#F7AB38',
        fontWeight: 'bold',
    },
    categoriaScrollViewSalvar: {
        maxHeight: 250,
        width: '100%',
        marginBottom: 20,
    }
});
