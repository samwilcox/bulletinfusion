/**
 * BULLETIN FUSION
 * by Sam Wilcox <sam@bulletinfusion.com>
 * 
 * https://www.bulletinfusion.com
 * 
 * Bulletin Fusion is released under the GPL v3 license.
 * To view the license, visit:
 * https://license.bulletinfusion.com
 */

const natural = require('natural');
const UtilHelper = require('../helpers/util-helper');
const ForumRepository = require('../repository/forum-repository');
const tfidf = new natural.TfIdf();

/**
 * Service for determining related topics to a current one.
 */
class SimilarTopicsService {
    static instance = null;

    /**
     * Get the singleton instance for SimilarTopicsService.
     * 
     * @returns {SimilarTopicsService} - The singleton instance of SimilarTopicsService.
     */
    static getInstance() {
        if (!SimilarTopicsService.instance) {
            SimilarTopicsService.instance = new SimilarTopicsService();
        }

        return SimilarTopicsService.instance;
    }

    /**
     * Get the similar topics to a given topic by analyzing their contents and seeing
     * which topics are similar.
     * 
     * @param {number} currentTopicId - The current topic identifier.
     * @returns {Array} An array of the similar topics.
     */
    getSimilarTopicsByContent(currentTopicId) {
        const TopicRepository = require('../repository/topic-repository');
        const currentTopic = TopicRepository.getTopicById(currentTopicId);

        if (currentTopic) {
            const forum = ForumRepository.getForumById(currentTopic.getForumId());
            if (!currentTopic) return [];

            const topics = TopicRepository.findForSimilar({ forumId: forum.getSimilarTopicsForums() });
            const currentTopicTitle = currentTopic.getTitle();
            const currentTopicContent = currentTopic.mergePostsContent();

            const documents = topics.map(topic => {
                return {
                    id: topic.getId(),
                    title: topic.getTitle(),
                    content: topic.mergePostsContent(),
                };
            }).filter(topic => topic !== null);

            const allDocuments = [currentTopicTitle + " " + currentTopicContent, ...documents.map(doc => doc.title + " " + doc.content)];
            const tokenizedDocs = allDocuments.map(doc => UtilHelper.tokenize(doc));

            const tfidScores = tokenizedDocs.map(doc => {
                const documentIndex = tokenizedDocs.indexOf(doc);
                const document = documents[documentIndex];

                if (!document) {
                    console.warn(`Document at index ${documentIndex} is undefined`);
                    return null;
                }

                return {
                    tfidf: this.calculateTFIDF(doc, tokenizedDocs),
                    id: document.id,
                };
            }).filter(doc => doc !== null);

            const currentTopicTFIDF = tfidScores[0].tfidf;
            let similarities = [];

            if (currentTopicTFIDF) {
                similarities = tfidScores.slice(1).map(score => {
                    if (score) {
                        const similarity = this.cosineSimilarity(currentTopicTFIDF, score.tfidf);
    
                        return {
                            id: score.id,
                            similarity,
                        };
                    }

                    return null;
                }).filter(similarity => similarity !== null);
            }

            similarities.sort((a, b) => b.similarity - a.similarity);
            return similarities.map(similarity => similarity.id);
        } else {
            return [];
        }
    }

    /**
     * Calculates the term frequency (TF) for each word in a document.
     * 
     * @param {Array} doc - The tokenized document (array of words).
     * @returns {Object} The term frequency of each word. 
     */
    termFrequency(doc) {
        const tf = {};

        doc.forEach(word => {
            tf[word] = (tf[word] || 0) + 1;
        });

        return tf;
    }

    /**
     * Calculates inverse document frequency (IDF) for a term.
     * 
     * @param {Array} docs - The array of tokenized documents.
     * @param {string} term - The term for which to calculate IDF.
     * @returns {number} Yje IDF score of the term.
     */
    inverseDocumentFrequency(docs, term) {
        const docCountWithTerm = docs.filter(doc => doc.includes(term)).length;
        return Math.log(docs.length / (1 + docCountWithTerm));
    }

    /**
     * Calculates the TF-IDF for a document.
     * 
     * @param {Array} doc - The tokenized document (array of words).
     * @param {Array} docs - The array of all tokenized documents.
     * @returns {Object} The TF-IDF scores for each word in the document.
     */
    calculateTFIDF(doc, docs) {
        const tf = this.termFrequency(doc);
        const tfidf = {};

        Object.keys(tf).forEach(term => {
            const idf = this.inverseDocumentFrequency(docs, term);
            tfidf[term] = tf[term] * idf;
        });

        return tfidf;
    }

    /**
     * Calculates cosine similarity between two TF-IDF vectors.
     * 
     * @param {Object} vector1 - The first TF-IDF vector.
     * @param {Object} vector2 - The second TF-IDF vector.
     * @returns {number} The cosine similarity between the two vectors.
     */
    cosineSimilarity(vector1, vector2) {
        const dotProduct = Object.keys(vector1).reduce((sum, term) => sum + (vector1[term] || 0) * (vector2[term] || 0), 0);
        const magnitude1 = Math.sqrt(Object.values(vector1).reduce((sum, score) => sum + score * score, 0));
        const magnitude2 = Math.sqrt(Object.values(vector1).reduce((sum, score) => sum + score * score, 0));
        return dotProduct / (magnitude1 * magnitude2);
    }
}

module.exports = SimilarTopicsService.getInstance();